import type { ToolDefinition } from '../../core/types.js';
import { getIntegrationInputSchema } from '../../schemas/integrations.js';

export const get_integrationTool: ToolDefinition<typeof getIntegrationInputSchema> = {
  name: 'get_integration',
  description: 'Get integration details by integration ID.',
  inputSchema: getIntegrationInputSchema,
  async execute(ctx, input) {
    return ctx.services.integrationService.getIntegration(input as never);
  }
};
