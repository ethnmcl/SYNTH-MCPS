import { Buffer } from 'node:buffer';
import { z } from 'zod';
import { ownerRepoSchema } from '../../schemas/common.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo, guardWrite } from '../common.js';
import { result } from '../../utils/result.js';

const fileChangeSchema = z.object({
  path: z.string().min(1),
  content: z.string(),
  mode: z.enum(['100644', '100755']).default('100644')
});

const schema = ownerRepoSchema.extend({
  branch: z.string().min(1),
  message: z.string().min(1),
  files: z.array(fileChangeSchema).min(1)
});

export const createCommitFromFileChangesTool: GithubTool<typeof schema> = {
  name: 'github_create_commit_from_file_changes',
  description: 'Create a commit by writing multiple file blobs and updating a branch ref.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardWrite(ctx);
    guardRepo(ctx, input.owner, input.repo);

    const currentRef = await ctx.octokit.rest.git.getRef({
      owner: input.owner,
      repo: input.repo,
      ref: `heads/${input.branch}`
    });

    const currentCommitSha = currentRef.data.object.sha;
    const currentCommit = await ctx.octokit.rest.git.getCommit({
      owner: input.owner,
      repo: input.repo,
      commit_sha: currentCommitSha
    });

    const treeItems = await Promise.all(
      input.files.map(async (file) => {
        const blob = await ctx.octokit.rest.git.createBlob({
          owner: input.owner,
          repo: input.repo,
          content: Buffer.from(file.content, 'utf-8').toString('base64'),
          encoding: 'base64'
        });

        return {
          path: file.path,
          mode: file.mode,
          type: 'blob' as const,
          sha: blob.data.sha
        };
      })
    );

    const newTree = await ctx.octokit.rest.git.createTree({
      owner: input.owner,
      repo: input.repo,
      base_tree: currentCommit.data.tree.sha,
      tree: treeItems
    });

    const commit = await ctx.octokit.rest.git.createCommit({
      owner: input.owner,
      repo: input.repo,
      message: input.message,
      tree: newTree.data.sha,
      parents: [currentCommitSha]
    });

    await ctx.octokit.rest.git.updateRef({
      owner: input.owner,
      repo: input.repo,
      ref: `heads/${input.branch}`,
      sha: commit.data.sha,
      force: false
    });

    return result(`Created commit ${commit.data.sha} on ${input.branch}`, {
      branch: input.branch,
      commit_sha: commit.data.sha,
      tree_sha: newTree.data.sha,
      parent_sha: currentCommitSha,
      files_changed: input.files.length,
      commit_url: commit.data.url
    });
  }
};
