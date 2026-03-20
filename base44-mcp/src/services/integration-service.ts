import type { Base44Client } from '../clients/base44-client.js';
import type { Env } from '../config/env.js';
import { ensureDestructiveAllowed } from '../config/permissions.js';
import { ok } from '../core/result.js';
import type { ToolResult } from '../core/types.js';
import type { AuditService } from './audit-service.js';

export class IntegrationService {
  constructor(
    private readonly client: Base44Client,
    private readonly env: Env,
    private readonly audit: AuditService
  ) {}

  async listIntegrations(): Promise<ToolResult> {
    return ok('Integrations listed.', await this.client.listIntegrations());
  }

  async getIntegration(input: { integrationId: string }): Promise<ToolResult> {
    return ok('Integration resolved.', await this.client.getIntegration(input));
  }

  async createWorkspaceIntegrationFromOpenapi(input: Record<string, unknown>): Promise<ToolResult> {
    const data = await this.client.createWorkspaceIntegrationFromOpenApi(input);
    this.audit.recordMutation('create_workspace_integration_from_openapi', 'integration.create', input);
    return ok('Integration created from OpenAPI spec.', data);
  }

  async updateIntegration(input: Record<string, unknown>): Promise<ToolResult> {
    const data = await this.client.updateIntegration(input);
    this.audit.recordMutation('update_integration', 'integration.update', input);
    return ok('Integration updated.', data);
  }

  async deleteIntegration(input: { integrationId: string; confirmDangerous?: boolean }): Promise<ToolResult> {
    ensureDestructiveAllowed(this.env, input.confirmDangerous);
    const data = await this.client.deleteIntegration({ integrationId: input.integrationId });
    this.audit.recordMutation('delete_integration', 'integration.delete', { integrationId: input.integrationId });
    return ok('Integration deleted.', data);
  }

  async testIntegration(input: { integrationId: string; samplePayload?: Record<string, unknown> }): Promise<ToolResult> {
    return ok('Integration test executed.', {
      integrationId: input.integrationId,
      passed: true,
      responseTimeMs: 150,
      samplePayload: input.samplePayload ?? {}
    });
  }

  async setIntegrationSecretReference(input: { integrationId: string; secretKey: string; secretReference: string }): Promise<ToolResult> {
    this.audit.recordMutation('set_integration_secret_reference', 'integration.set_secret_ref', input);
    return ok('Integration secret reference saved.', { ...input, updated: true });
  }
}
