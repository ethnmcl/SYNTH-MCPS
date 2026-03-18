import { z } from 'zod';
import { ownerRepoSchema } from '../../schemas/common.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({
  state: z.enum(['open', 'closed', 'all']).default('open'),
  sort: z.enum(['created', 'updated', 'comments']).default('created'),
  direction: z.enum(['asc', 'desc']).default('desc'),
  per_page: z.number().int().min(1).max(100).default(30),
  page: z.number().int().min(1).default(1)
});

export const listIssuesTool: GithubTool<typeof schema> = {
  name: 'github_list_issues',
  description: 'List repository issues.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.issues.listForRepo(input);
    return result(`Fetched ${data.length} issues`, {
      count: data.length,
      issues: data.map((issue) => ({
        number: issue.number,
        title: issue.title,
        state: issue.state,
        user: issue.user?.login,
        labels: issue.labels.map((l) => (typeof l === 'string' ? l : l.name)),
        html_url: issue.html_url
      }))
    });
  }
};
