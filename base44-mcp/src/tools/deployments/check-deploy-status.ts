import type { ToolDefinition } from '../../core/types.js';
import { checkDeployStatusInputSchema } from '../../schemas/deployments.js';

export const check_deploy_statusTool: ToolDefinition<typeof checkDeployStatusInputSchema> = {
  name: 'check_deploy_status',
  description: 'Check current status for a deployment ID.',
  inputSchema: checkDeployStatusInputSchema,
  async execute(ctx, input) {
    return ctx.services.deploymentService.checkDeployStatus(input as never);
  }
};
