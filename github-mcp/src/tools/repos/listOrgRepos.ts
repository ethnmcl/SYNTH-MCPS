import { z } from 'zod';
import { ownerSchema } from '../../schemas/common.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerSchema.extend({
  type: z.enum(['all', 'public', 'private', 'forks', 'sources', 'member']).default('all'),
  sort: z.enum(['created', 'updated', 'pushed', 'full_name']).default('updated'),
  per_page: z.number().int().min(1).max(100).default(30),
  page: z.number().int().min(1).default(1)
});

export const listOrgReposTool: GithubTool<typeof schema> = {
  name: 'github_list_org_repos',
  description: 'List repositories in an organization.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardRepo(ctx, input.owner);
    const { data } = await ctx.octokit.rest.repos.listForOrg({
      org: input.owner,
      type: input.type,
      sort: input.sort,
      per_page: input.per_page,
      page: input.page
    });

    return result(`Fetched ${data.length} organization repositories`, {
      count: data.length,
      repositories: data.map((repo) => ({
        id: repo.id,
        full_name: repo.full_name,
        private: repo.private,
        default_branch: repo.default_branch,
        html_url: repo.html_url
      }))
    });
  }
};
