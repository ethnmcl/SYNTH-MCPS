import { z } from 'zod';
import type { GithubTool } from '../../types/tool.js';
import { result } from '../../utils/result.js';

const schema = z.object({
  username: z.string().optional(),
  type: z.enum(['all', 'owner', 'member']).default('owner'),
  sort: z.enum(['created', 'updated', 'pushed', 'full_name']).default('updated'),
  per_page: z.number().int().min(1).max(100).default(30),
  page: z.number().int().min(1).default(1)
});

export const listUserReposTool: GithubTool<typeof schema> = {
  name: 'github_list_user_repos',
  description: 'List repositories for the authenticated user or a specific user.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    const data = input.username
      ? (await ctx.octokit.rest.repos.listForUser({
          username: input.username,
          type: input.type,
          sort: input.sort,
          per_page: input.per_page,
          page: input.page
        })).data
      : (await ctx.octokit.rest.repos.listForAuthenticatedUser({
          visibility: 'all',
          affiliation: 'owner,collaborator,organization_member',
          sort: input.sort,
          per_page: input.per_page,
          page: input.page
        })).data;

    return result(`Fetched ${data.length} repositories`, {
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
