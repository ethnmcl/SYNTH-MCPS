import type { ToolDefinition } from '../../core/types.js';
import { updateIntegrationInputSchema } from '../../schemas/integrations.js';

export const update_integrationTool: ToolDefinition<typeof updateIntegrationInputSchema> = {
  name: 'update_integration',
  description: 'Update integration metadata and runtime configuration.',
  inputSchema: updateIntegrationInputSchema,
  async execute(ctx, input) {
    return ctx.services.integrationService.updateIntegration(input as never);
  }
};
