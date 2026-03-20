import type { ToolDefinition } from '../../core/types.js';
import { listConnectorsInputSchema } from '../../schemas/connectors.js';

export const list_connectorsTool: ToolDefinition<typeof listConnectorsInputSchema> = {
  name: 'list_connectors',
  description: 'List available workspace connectors and their status.',
  inputSchema: listConnectorsInputSchema,
  async execute(ctx) {
    return ctx.services.connectorService.listConnectors();
  }
};
