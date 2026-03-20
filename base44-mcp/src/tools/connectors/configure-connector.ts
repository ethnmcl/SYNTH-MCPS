import type { ToolDefinition } from '../../core/types.js';
import { configureConnectorInputSchema } from '../../schemas/connectors.js';

export const configure_connectorTool: ToolDefinition<typeof configureConnectorInputSchema> = {
  name: 'configure_connector',
  description: 'Configure connector settings and auth options.',
  inputSchema: configureConnectorInputSchema,
  async execute(ctx, input) {
    return ctx.services.connectorService.configureConnector(input as never);
  }
};
