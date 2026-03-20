import type { ToolDefinition } from '../../core/types.js';
import { ok } from '../../core/result.js';
import { getToolMetadataInputSchema } from '../../schemas/admin.js';

export const get_tool_metadataTool: ToolDefinition<typeof getToolMetadataInputSchema> = {
  name: 'get_tool_metadata',
  description: 'Return tool catalog metadata registered in this MCP server.',
  inputSchema: getToolMetadataInputSchema,
  async execute(ctx) {
    return ok('Tool metadata retrieved.', ctx.services.auditService.getToolMetadata(ctx.toolMetadata));
  }
};
