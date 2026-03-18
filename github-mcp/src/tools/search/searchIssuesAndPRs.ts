import { z } from 'zod';
import type { GithubTool } from '../../types/tool.js';
import { result } from '../../utils/result.js';

const schema = z.object({
  query: z.string().min(1),
  sort: z.enum(['comments', 'reactions', 'created', 'updated']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  per_page: z.number().int().min(1).max(100).default(20),
  page: z.number().int().min(1).default(1)
});

export const searchIssuesAndPRsTool: GithubTool<typeof schema> = {
  name: 'github_search_issues_and_pull_requests',
  description: 'Search issues and pull requests.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    const { data } = await ctx.octokit.rest.search.issuesAndPullRequests({
      q: input.query,
      sort: input.sort,
      order: input.order,
      per_page: input.per_page,
      page: input.page
    });

    return result(`Found ${data.total_count} issue/PR results`, {
      total_count: data.total_count,
      incomplete_results: data.incomplete_results,
      items: data.items.map((item) => ({
        id: item.id,
        number: item.number,
        title: item.title,
        state: item.state,
        user: item.user?.login,
        html_url: item.html_url,
        is_pull_request: Boolean(item.pull_request)
      }))
    });
  }
};
