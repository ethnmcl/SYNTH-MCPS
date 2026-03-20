import type { Base44Client } from '../clients/base44-client.js';
import { ok } from '../core/result.js';
import type { ToolResult } from '../core/types.js';
import type { AuditService } from './audit-service.js';

export class AuthService {
  constructor(
    private readonly client: Base44Client,
    private readonly audit: AuditService
  ) {}

  async login(input: Record<string, unknown>): Promise<ToolResult> {
    const data = await this.client.login(input);
    this.audit.recordMutation('login', 'auth.login', input);
    return ok('Authenticated with Base44.', data);
  }

  async logout(): Promise<ToolResult> {
    const data = await this.client.logout();
    this.audit.recordMutation('logout', 'auth.logout', {});
    return ok('Session invalidated.', data);
  }

  async whoami(): Promise<ToolResult> {
    return ok('Current Base44 identity resolved.', await this.client.whoami());
  }

  async listWorkspaces(): Promise<ToolResult> {
    return ok('Listed available workspaces.', await this.client.listWorkspaces());
  }
}
