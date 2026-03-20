import type { Base44Client } from '../clients/base44-client.js';
import type { LocalProjectClient } from '../clients/local-project-client.js';
import { ok } from '../core/result.js';
import type { ToolResult } from '../core/types.js';
import type { AuditService } from './audit-service.js';

export class DeploymentService {
  constructor(
    private readonly client: Base44Client,
    private readonly localClient: LocalProjectClient,
    private readonly audit: AuditService
  ) {}

  async deployProject(input: Record<string, unknown>): Promise<ToolResult> {
    const data = await this.client.deployProject(input);
    this.audit.recordMutation('deploy_project', 'deployment.deploy', input);
    return ok('Deployment started.', data);
  }

  async checkDeployStatus(input: { deploymentId: string }): Promise<ToolResult> {
    return ok('Deployment status fetched.', await this.client.checkDeployStatus(input));
  }

  async validateProjectStructure(input: { projectRoot?: string }): Promise<ToolResult> {
    const root = input.projectRoot ?? '.';
    const expected = [
      'base44/config.jsonc',
      'base44/entities',
      'base44/functions',
      'base44/skills',
      'base44/connectors',
      'base44/integrations'
    ];

    const checks = await Promise.all(expected.map(async (path) => ({ path, exists: await this.localClient.exists(`${root}/${path}`) })));
    const missing = checks.filter((c) => !c.exists).map((c) => c.path);

    return ok('Local Base44 project structure validated.', {
      projectRoot: root,
      checks,
      missing,
      valid: missing.length === 0,
      recommendations: missing.map((m) => `Create ${m} or run create_config_jsonc.`)
    });
  }

  async syncLocalProject(input: { projectRoot?: string; mode?: 'push' | 'pull' }): Promise<ToolResult> {
    this.audit.recordMutation('sync_local_project', 'deployment.sync_local', input as Record<string, unknown>);
    return ok('Local sync completed in mock mode.', {
      projectRoot: input.projectRoot ?? '.',
      mode: input.mode ?? 'push',
      syncedAt: new Date().toISOString()
    });
  }
}
