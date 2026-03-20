import type { ToolDefinition } from '../../core/types.js';
import { getConnectorInputSchema } from '../../schemas/connectors.js';

export const get_connectorTool: ToolDefinition<typeof getConnectorInputSchema> = {
  name: 'get_connector',
  description: 'Get connector metadata and configuration state.',
  inputSchema: getConnectorInputSchema,
  async execute(ctx, input) {
    return ctx.services.connectorService.getConnector(input as never);
  }
};
