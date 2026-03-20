import type { Base44Client } from '../clients/base44-client.js';
import { ok } from '../core/result.js';
import type { ToolResult } from '../core/types.js';
import type { AuditService } from './audit-service.js';

export class ConnectorService {
  constructor(
    private readonly client: Base44Client,
    private readonly audit: AuditService
  ) {}

  async listConnectors(): Promise<ToolResult> {
    return ok('Connectors listed.', await this.client.listConnectors());
  }

  async getConnector(input: { connectorId: string }): Promise<ToolResult> {
    return ok('Connector resolved.', await this.client.getConnector(input));
  }

  async configureConnector(input: Record<string, unknown>): Promise<ToolResult> {
    const data = await this.client.configureConnector(input);
    this.audit.recordMutation('configure_connector', 'connector.configure', input);
    return ok('Connector configured.', data);
  }

  async disconnectConnector(input: { connectorId: string }): Promise<ToolResult> {
    const data = await this.client.disconnectConnector(input);
    this.audit.recordMutation('disconnect_connector', 'connector.disconnect', input);
    return ok('Connector disconnected.', data);
  }
}
