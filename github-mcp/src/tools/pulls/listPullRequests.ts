import { z } from 'zod';
import { ownerRepoSchema } from '../../schemas/common.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({
  state: z.enum(['open', 'closed', 'all']).default('open'),
  sort: z.enum(['created', 'updated', 'popularity', 'long-running']).default('created'),
  direction: z.enum(['asc', 'desc']).default('desc'),
  per_page: z.number().int().min(1).max(100).default(30),
  page: z.number().int().min(1).default(1)
});

export const listPullRequestsTool: GithubTool<typeof schema> = {
  name: 'github_list_pull_requests',
  description: 'List pull requests for a repository.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.pulls.list(input);
    return result(`Fetched ${data.length} pull requests`, {
      count: data.length,
      pull_requests: data.map((pr) => ({
        number: pr.number,
        title: pr.title,
        state: pr.state,
        draft: pr.draft,
        user: pr.user?.login,
        html_url: pr.html_url
      }))
    });
  }
};
