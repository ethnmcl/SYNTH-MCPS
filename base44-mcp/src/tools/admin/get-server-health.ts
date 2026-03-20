import type { ToolDefinition } from '../../core/types.js';
import { ok } from '../../core/result.js';
import { getServerHealthInputSchema } from '../../schemas/admin.js';

export const get_server_healthTool: ToolDefinition<typeof getServerHealthInputSchema> = {
  name: 'get_server_health',
  description: 'Return server health, runtime mode, and capability summary.',
  inputSchema: getServerHealthInputSchema,
  async execute(ctx) {
    return ok('Server health retrieved.', ctx.services.auditService.getServerHealth(ctx.toolMetadata.length));
  }
};
