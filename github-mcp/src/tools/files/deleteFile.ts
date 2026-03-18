import { z } from 'zod';
import { ownerRepoPathSchema } from '../../schemas/common.js';
import type { GithubTool } from '../../types/tool.js';
import { AppError } from '../../utils/errors.js';
import { guardRepo, guardWrite } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoPathSchema.extend({
  message: z.string().min(1),
  sha: z.string().min(1),
  branch: z.string().optional(),
  committer_name: z.string().optional(),
  committer_email: z.string().email().optional(),
  author_name: z.string().optional(),
  author_email: z.string().email().optional()
});

export const deleteFileTool: GithubTool<typeof schema> = {
  name: 'github_delete_file',
  description: 'Delete a file from a repository.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardWrite(ctx);
    guardRepo(ctx, input.owner, input.repo);

    if (!input.sha) {
      throw new AppError('sha is required to delete file safely', 400);
    }

    const { data } = await ctx.octokit.rest.repos.deleteFile({
      owner: input.owner,
      repo: input.repo,
      path: input.path,
      message: input.message,
      sha: input.sha,
      branch: input.branch,
      committer:
        input.committer_name && input.committer_email
          ? { name: input.committer_name, email: input.committer_email }
          : undefined,
      author:
        input.author_name && input.author_email
          ? { name: input.author_name, email: input.author_email }
          : undefined
    });

    return result(`Deleted file ${input.path}`, {
      commit: {
        sha: data.commit.sha,
        message: data.commit.message,
        html_url: data.commit.html_url
      }
    });
  }
};
