import { z } from 'zod';
import type { GithubTool } from '../../types/tool.js';
import { result } from '../../utils/result.js';

const schema = z.object({
  query: z.string().min(1),
  sort: z.enum(['stars', 'forks', 'help-wanted-issues', 'updated']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  per_page: z.number().int().min(1).max(100).default(20),
  page: z.number().int().min(1).default(1)
});

export const searchReposTool: GithubTool<typeof schema> = {
  name: 'github_search_repositories',
  description: 'Search repositories.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    const { data } = await ctx.octokit.rest.search.repos({
      q: input.query,
      sort: input.sort,
      order: input.order,
      per_page: input.per_page,
      page: input.page
    });

    return result(`Found ${data.total_count} repositories`, {
      total_count: data.total_count,
      incomplete_results: data.incomplete_results,
      items: data.items.map((repo) => ({
        id: repo.id,
        full_name: repo.full_name,
        description: repo.description,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        html_url: repo.html_url
      }))
    });
  }
};
