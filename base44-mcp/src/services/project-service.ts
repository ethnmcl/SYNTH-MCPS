import type { Base44Client } from '../clients/base44-client.js';
import type { Env } from '../config/env.js';
import { ensureDestructiveAllowed } from '../config/permissions.js';
import { ok } from '../core/result.js';
import type { ToolResult } from '../core/types.js';
import type { AuditService } from './audit-service.js';

export class ProjectService {
  private activeProjectId: string | null = null;

  constructor(
    private readonly client: Base44Client,
    private readonly env: Env,
    private readonly audit: AuditService
  ) {}

  async createProject(input: Record<string, unknown>): Promise<ToolResult> {
    const data = await this.client.createProject(input);
    this.audit.recordMutation('create_project', 'project.create', input);
    return ok('Project created.', data);
  }

  async listProjects(input: { workspaceId?: string } = {}): Promise<ToolResult> {
    return ok('Projects listed.', await this.client.listProjects(input));
  }

  async getProject(input: { projectId: string }): Promise<ToolResult> {
    return ok('Project resolved.', await this.client.getProject(input));
  }

  async updateProject(input: Record<string, unknown> & { projectId: string }): Promise<ToolResult> {
    const data = await this.client.updateProject(input);
    this.audit.recordMutation('update_project', 'project.update', input);
    return ok('Project updated.', data);
  }

  async deleteProject(input: { projectId: string; confirmDangerous?: boolean }): Promise<ToolResult> {
    ensureDestructiveAllowed(this.env, input.confirmDangerous);
    const data = await this.client.deleteProject({ projectId: input.projectId });
    this.audit.recordMutation('delete_project', 'project.delete', { projectId: input.projectId });
    return ok('Project deleted.', data);
  }

  async cloneProject(input: Record<string, unknown>): Promise<ToolResult> {
    const data = await this.client.cloneProject(input);
    this.audit.recordMutation('clone_project', 'project.clone', input);
    return ok('Project cloned.', data);
  }

  async setActiveProject(input: { projectId: string }): Promise<ToolResult> {
    this.activeProjectId = input.projectId;
    this.audit.recordMutation('set_active_project', 'project.set_active', input);
    return ok('Active project updated for this MCP process.', { activeProjectId: this.activeProjectId });
  }
}
