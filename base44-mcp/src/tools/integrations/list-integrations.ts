import type { ToolDefinition } from '../../core/types.js';
import { listIntegrationsInputSchema } from '../../schemas/integrations.js';

export const list_integrationsTool: ToolDefinition<typeof listIntegrationsInputSchema> = {
  name: 'list_integrations',
  description: 'List workspace integrations configured in Base44.',
  inputSchema: listIntegrationsInputSchema,
  async execute(ctx) {
    return ctx.services.integrationService.listIntegrations();
  }
};
