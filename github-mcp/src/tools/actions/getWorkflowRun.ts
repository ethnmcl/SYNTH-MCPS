import { z } from 'zod';
import { ownerRepoSchema } from '../../schemas/common.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({ run_id: z.number().int().positive() });

export const getWorkflowRunTool: GithubTool<typeof schema> = {
  name: 'github_get_workflow_run',
  description: 'Get details for a workflow run.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.actions.getWorkflowRun({
      owner: input.owner,
      repo: input.repo,
      run_id: input.run_id
    });
    return result(`Workflow run ${data.id} loaded`, {
      id: data.id,
      name: data.name,
      status: data.status,
      conclusion: data.conclusion,
      event: data.event,
      head_branch: data.head_branch,
      head_sha: data.head_sha,
      html_url: data.html_url,
      run_number: data.run_number
    });
  }
};
