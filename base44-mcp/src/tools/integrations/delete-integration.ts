import type { ToolDefinition } from '../../core/types.js';
import { deleteIntegrationInputSchema } from '../../schemas/integrations.js';

export const delete_integrationTool: ToolDefinition<typeof deleteIntegrationInputSchema> = {
  name: 'delete_integration',
  description: 'Delete an integration (destructive, guarded).',
  inputSchema: deleteIntegrationInputSchema,
  async execute(ctx, input) {
    return ctx.services.integrationService.deleteIntegration(input as never);
  }
};
