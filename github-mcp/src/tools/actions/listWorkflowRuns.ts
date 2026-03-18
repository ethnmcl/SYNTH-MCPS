import { z } from 'zod';
import { ownerRepoSchema } from '../../schemas/common.js';
import { workflowIdSchema } from '../../schemas/github.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({
  workflow_id: workflowIdSchema.optional(),
  branch: z.string().optional(),
  event: z.string().optional(),
  status: z
    .enum([
      'completed',
      'action_required',
      'cancelled',
      'failure',
      'neutral',
      'skipped',
      'stale',
      'success',
      'timed_out',
      'in_progress',
      'queued',
      'requested',
      'waiting',
      'pending'
    ])
    .optional(),
  per_page: z.number().int().min(1).max(100).default(30),
  page: z.number().int().min(1).default(1)
});

export const listWorkflowRunsTool: GithubTool<typeof schema> = {
  name: 'github_list_workflow_runs',
  description: 'List workflow runs for a repository or specific workflow.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardRepo(ctx, input.owner, input.repo);

    const data = input.workflow_id
      ? (await ctx.octokit.rest.actions.listWorkflowRuns({
          owner: input.owner,
          repo: input.repo,
          workflow_id: input.workflow_id,
          branch: input.branch,
          event: input.event,
          status: input.status,
          per_page: input.per_page,
          page: input.page
        })).data
      : (await ctx.octokit.rest.actions.listWorkflowRunsForRepo({
          owner: input.owner,
          repo: input.repo,
          branch: input.branch,
          event: input.event,
          status: input.status,
          per_page: input.per_page,
          page: input.page
        })).data;

    return result(`Fetched ${data.workflow_runs.length} workflow runs`, {
      total_count: data.total_count,
      workflow_runs: data.workflow_runs.map((run) => ({
        id: run.id,
        name: run.name,
        status: run.status,
        conclusion: run.conclusion,
        event: run.event,
        head_branch: run.head_branch,
        html_url: run.html_url,
        created_at: run.created_at
      }))
    });
  }
};
