import { z } from 'zod';
import { ownerRepoSchema } from '../../schemas/common.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo, guardWrite } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({
  run_id: z.number().int().positive(),
  enable_debug_logging: z.boolean().optional()
});

export const rerunWorkflowTool: GithubTool<typeof schema> = {
  name: 'github_rerun_workflow',
  description: 'Re-run a workflow run.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardWrite(ctx);
    guardRepo(ctx, input.owner, input.repo);
    await ctx.octokit.rest.actions.reRunWorkflow({
      owner: input.owner,
      repo: input.repo,
      run_id: input.run_id,
      enable_debug_logging: input.enable_debug_logging
    });
    return result(`Triggered rerun for workflow run ${input.run_id}`, {
      run_id: input.run_id,
      requested: true
    });
  }
};
