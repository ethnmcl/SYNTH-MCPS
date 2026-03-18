import { ownerRepoSchema } from '../../schemas/common.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema;

export const getDefaultBranchTool: GithubTool<typeof schema> = {
  name: 'github_get_default_branch',
  description: 'Get default branch details for a repository.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.repos.get(input);
    return result(`Default branch is ${data.default_branch}`, {
      owner: input.owner,
      repo: input.repo,
      default_branch: data.default_branch
    });
  }
};
