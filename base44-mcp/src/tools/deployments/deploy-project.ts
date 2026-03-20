import type { ToolDefinition } from '../../core/types.js';
import { deployProjectInputSchema } from '../../schemas/deployments.js';

export const deploy_projectTool: ToolDefinition<typeof deployProjectInputSchema> = {
  name: 'deploy_project',
  description: 'Trigger deployment for a Base44 project environment.',
  inputSchema: deployProjectInputSchema,
  async execute(ctx, input) {
    return ctx.services.deploymentService.deployProject(input as never);
  }
};
