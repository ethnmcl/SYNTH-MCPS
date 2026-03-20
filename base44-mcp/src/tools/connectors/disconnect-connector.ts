import type { ToolDefinition } from '../../core/types.js';
import { disconnectConnectorInputSchema } from '../../schemas/connectors.js';

export const disconnect_connectorTool: ToolDefinition<typeof disconnectConnectorInputSchema> = {
  name: 'disconnect_connector',
  description: 'Disconnect and deactivate a connector.',
  inputSchema: disconnectConnectorInputSchema,
  async execute(ctx, input) {
    return ctx.services.connectorService.disconnectConnector(input as never);
  }
};
