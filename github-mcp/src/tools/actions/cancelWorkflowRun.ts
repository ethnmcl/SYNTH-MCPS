import { z } from 'zod';
import { ownerRepoSchema } from '../../schemas/common.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo, guardWrite } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({ run_id: z.number().int().positive() });

export const cancelWorkflowRunTool: GithubTool<typeof schema> = {
  name: 'github_cancel_workflow_run',
  description: 'Cancel a workflow run.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardWrite(ctx);
    guardRepo(ctx, input.owner, input.repo);
    await ctx.octokit.rest.actions.cancelWorkflowRun({
      owner: input.owner,
      repo: input.repo,
      run_id: input.run_id
    });
    return result(`Cancel requested for workflow run ${input.run_id}`, {
      run_id: input.run_id,
      requested: true
    });
  }
};
