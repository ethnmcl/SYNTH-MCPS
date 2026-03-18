import { z } from 'zod';
import { ownerRepoSchema } from '../../schemas/common.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({
  per_page: z.number().int().min(1).max(100).default(30),
  page: z.number().int().min(1).default(1)
});

export const listWorkflowsTool: GithubTool<typeof schema> = {
  name: 'github_list_workflows',
  description: 'List repository GitHub Actions workflows.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.actions.listRepoWorkflows(input);
    return result(`Fetched ${data.workflows.length} workflows`, {
      total_count: data.total_count,
      workflows: data.workflows.map((w) => ({
        id: w.id,
        name: w.name,
        state: w.state,
        path: w.path,
        html_url: w.html_url
      }))
    });
  }
};
