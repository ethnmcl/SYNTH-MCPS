import { z } from 'zod';
import type { GithubTool } from '../../types/tool.js';
import { result } from '../../utils/result.js';

const schema = z.object({
  query: z.string().min(1),
  sort: z.enum(['followers', 'repositories', 'joined']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  per_page: z.number().int().min(1).max(100).default(20),
  page: z.number().int().min(1).default(1)
});

export const searchUsersTool: GithubTool<typeof schema> = {
  name: 'github_search_users',
  description: 'Search users.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    const { data } = await ctx.octokit.rest.search.users({
      q: input.query,
      sort: input.sort,
      order: input.order,
      per_page: input.per_page,
      page: input.page
    });

    return result(`Found ${data.total_count} users`, {
      total_count: data.total_count,
      incomplete_results: data.incomplete_results,
      items: data.items.map((item) => ({
        id: item.id,
        login: item.login,
        type: item.type,
        score: item.score,
        html_url: item.html_url
      }))
    });
  }
};
