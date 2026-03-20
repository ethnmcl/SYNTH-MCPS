import type { ToolDefinition } from '../../core/types.js';
import { ok } from '../../core/result.js';
import { getAuditLogInputSchema } from '../../schemas/admin.js';

export const get_audit_logTool: ToolDefinition<typeof getAuditLogInputSchema> = {
  name: 'get_audit_log',
  description: 'Read the in-memory mutation audit trail for this server process.',
  inputSchema: getAuditLogInputSchema,
  async execute(ctx) {
    return ok('Audit log retrieved.', ctx.services.auditService.getAuditLog());
  }
};
