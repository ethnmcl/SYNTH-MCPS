import { addAuditEntry, clearAuditEntries, listAuditEntries } from '../core/audit.js';
import type { AuditEntry } from '../core/audit.js';
import type { Env } from '../config/env.js';

export class AuditService {
  constructor(private readonly env: Env) {}

  recordMutation(toolName: string, action: string, payload: Record<string, unknown>): AuditEntry {
    return addAuditEntry({ toolName, action, payload });
  }

  getAuditLog(): Record<string, unknown> {
    const items = listAuditEntries();
    return { items, count: items.length };
  }

  clearAuditLog(confirmDangerous: boolean): Record<string, unknown> {
    if (!confirmDangerous || !this.env.ALLOW_DESTRUCTIVE_TOOLS) {
      return { cleared: false, reason: 'confirmDangerous=true and ALLOW_DESTRUCTIVE_TOOLS=true are required' };
    }
    const removed = clearAuditEntries();
    return { cleared: true, removed };
  }

  getServerHealth(toolCount: number): Record<string, unknown> {
    return {
      status: 'ok',
      name: this.env.MCP_SERVER_NAME,
      version: this.env.MCP_SERVER_VERSION,
      mockMode: this.env.BASE44_MOCK_MODE,
      allowDestructiveTools: this.env.ALLOW_DESTRUCTIVE_TOOLS,
      toolCount,
      timestamp: new Date().toISOString()
    };
  }

  getToolMetadata(tools: Array<{ name: string; description: string }>): Record<string, unknown> {
    return { count: tools.length, items: tools };
  }
}
