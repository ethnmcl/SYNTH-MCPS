import { z } from 'zod';
import { ownerRepoSchema } from '../../schemas/common.js';
import type { GithubTool } from '../../types/tool.js';
import { AppError } from '../../utils/errors.js';
import { guardRepo, guardWrite } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({
  branch: z.string().min(1),
  from_ref: z.string().min(1)
});

export const createBranchTool: GithubTool<typeof schema> = {
  name: 'github_create_branch',
  description: 'Create a new branch from an existing ref.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardWrite(ctx);
    guardRepo(ctx, input.owner, input.repo);

    const source = await ctx.octokit.rest.git.getRef({
      owner: input.owner,
      repo: input.repo,
      ref: `heads/${input.from_ref}`
    });

    try {
      const { data } = await ctx.octokit.rest.git.createRef({
        owner: input.owner,
        repo: input.repo,
        ref: `refs/heads/${input.branch}`,
        sha: source.data.object.sha
      });
      return result(`Created branch '${input.branch}'`, {
        ref: data.ref,
        sha: data.object.sha,
        url: data.url
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Reference already exists')) {
        throw new AppError(`Branch '${input.branch}' already exists`, 409);
      }
      throw error;
    }
  }
};
