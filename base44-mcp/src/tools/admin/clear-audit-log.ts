import type { ToolDefinition } from '../../core/types.js';
import { ok } from '../../core/result.js';
import { clearAuditLogInputSchema } from '../../schemas/admin.js';

export const clear_audit_logTool: ToolDefinition<typeof clearAuditLogInputSchema> = {
  name: 'clear_audit_log',
  description: 'Clear in-memory audit log entries (destructive, guarded).',
  inputSchema: clearAuditLogInputSchema,
  async execute(ctx, input) {
    return ok(
      'Audit log clear operation completed.',
      ctx.services.auditService.clearAuditLog((input as { confirmDangerous: boolean }).confirmDangerous)
    );
  }
};
