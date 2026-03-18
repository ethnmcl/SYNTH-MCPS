import { Buffer } from 'node:buffer';
import { z } from 'zod';
import { ownerRepoPathSchema } from '../../schemas/common.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo, guardWrite } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoPathSchema.extend({
  content: z.string(),
  message: z.string().min(1),
  branch: z.string().optional(),
  sha: z.string().optional(),
  committer_name: z.string().optional(),
  committer_email: z.string().email().optional(),
  author_name: z.string().optional(),
  author_email: z.string().email().optional()
});

export const createOrUpdateFileTool: GithubTool<typeof schema> = {
  name: 'github_create_or_update_file',
  description: 'Create or update a file in a repository.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardWrite(ctx);
    guardRepo(ctx, input.owner, input.repo);

    const { data } = await ctx.octokit.rest.repos.createOrUpdateFileContents({
      owner: input.owner,
      repo: input.repo,
      path: input.path,
      message: input.message,
      content: Buffer.from(input.content, 'utf-8').toString('base64'),
      branch: input.branch,
      sha: input.sha,
      committer:
        input.committer_name && input.committer_email
          ? { name: input.committer_name, email: input.committer_email }
          : undefined,
      author:
        input.author_name && input.author_email
          ? { name: input.author_name, email: input.author_email }
          : undefined
    });

    return result(`Committed file ${input.path}`, {
      content: {
        path: data.content?.path,
        sha: data.content?.sha
      },
      commit: {
        sha: data.commit.sha,
        message: data.commit.message,
        html_url: data.commit.html_url
      }
    });
  }
};
