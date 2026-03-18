import { z } from 'zod';
import { ownerRepoSchema } from '../../schemas/common.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({ run_id: z.number().int().positive() });

export const getWorkflowRunLogsInfoTool: GithubTool<typeof schema> = {
  name: 'github_get_workflow_run_logs_info',
  description: 'Get metadata and redirect URL info for workflow run logs.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardRepo(ctx, input.owner, input.repo);
    const response = await ctx.octokit.request('GET /repos/{owner}/{repo}/actions/runs/{run_id}/logs', {
      owner: input.owner,
      repo: input.repo,
      run_id: input.run_id,
      request: { redirect: 'manual' }
    });

    const location = (response.headers as Record<string, string | undefined>).location;
    return result(`Workflow logs info for run ${input.run_id}`, {
      run_id: input.run_id,
      redirect_url: location,
      status: response.status
    });
  }
};
