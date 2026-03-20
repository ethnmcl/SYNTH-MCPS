import type { ToolDefinition } from '../../core/types.js';
import { syncLocalProjectInputSchema } from '../../schemas/deployments.js';

export const sync_local_projectTool: ToolDefinition<typeof syncLocalProjectInputSchema> = {
  name: 'sync_local_project',
  description: 'Sync local Base44 project state in push or pull mode.',
  inputSchema: syncLocalProjectInputSchema,
  async execute(ctx, input) {
    return ctx.services.deploymentService.syncLocalProject(input as never);
  }
};
