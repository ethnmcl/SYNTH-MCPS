import { z } from 'zod';
import { ownerRepoSchema } from '../../schemas/common.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({
  protected: z.boolean().optional(),
  per_page: z.number().int().min(1).max(100).default(30),
  page: z.number().int().min(1).default(1)
});

export const listRepoBranchesTool: GithubTool<typeof schema> = {
  name: 'github_list_repo_branches',
  description: 'List branches in a repository.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.repos.listBranches(input);

    return result(`Fetched ${data.length} branches`, {
      count: data.length,
      branches: data.map((branch) => ({
        name: branch.name,
        sha: branch.commit.sha,
        protected: branch.protected
      }))
    });
  }
};
