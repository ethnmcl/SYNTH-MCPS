import { z } from 'zod';
import { ownerRepoSchema } from '../../schemas/common.js';
import { workflowIdSchema } from '../../schemas/github.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo, guardWrite } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({
  workflow_id: workflowIdSchema,
  ref: z.string().min(1),
  inputs: z.record(z.string(), z.string()).optional()
});

export const dispatchWorkflowTool: GithubTool<typeof schema> = {
  name: 'github_dispatch_workflow',
  description: 'Dispatch a workflow run by workflow_dispatch event.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardWrite(ctx);
    guardRepo(ctx, input.owner, input.repo);
    await ctx.octokit.rest.actions.createWorkflowDispatch({
      owner: input.owner,
      repo: input.repo,
      workflow_id: input.workflow_id,
      ref: input.ref,
      inputs: input.inputs
    });

    return result(`Workflow dispatch requested for ${String(input.workflow_id)}`, {
      workflow_id: input.workflow_id,
      ref: input.ref,
      requested: true
    });
  }
};
