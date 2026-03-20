import type { LocalProjectClient } from '../clients/local-project-client.js';
import { ok } from '../core/result.js';
import type { ToolResult } from '../core/types.js';
import { readTemplate } from '../utils/templates.js';
import type { AuditService } from './audit-service.js';

export class FileService {
  constructor(
    private readonly localClient: LocalProjectClient,
    private readonly audit: AuditService
  ) {}

  async readProjectFile(input: { path: string }): Promise<ToolResult> {
    const content = await this.localClient.readProjectFile(input.path);
    return ok('Project file read.', { path: input.path, content });
  }

  async writeProjectFile(input: { path: string; content: string }): Promise<ToolResult> {
    await this.localClient.writeProjectFile(input.path, input.content);
    this.audit.recordMutation('write_project_file', 'file.write', input);
    return ok('Project file written.', { path: input.path, bytes: input.content.length });
  }

  async listProjectFiles(input: { path: string }): Promise<ToolResult> {
    return ok('Project files listed.', { path: input.path, items: await this.localClient.listProjectFiles(input.path) });
  }

  async createConfigJsonc(input: { path?: string; workspaceId: string; projectId: string; projectName: string }): Promise<ToolResult> {
    const template = await readTemplate('config.jsonc.template');
    const content = template
      .replaceAll('{{workspaceId}}', input.workspaceId)
      .replaceAll('{{projectId}}', input.projectId)
      .replaceAll('{{projectName}}', input.projectName);

    const pathValue = input.path ?? 'base44/config.jsonc';
    await this.localClient.writeProjectFile(pathValue, content);
    this.audit.recordMutation('create_config_jsonc', 'file.create_config', { path: pathValue });
    return ok('Created starter base44/config.jsonc file.', { path: pathValue, content });
  }
}
