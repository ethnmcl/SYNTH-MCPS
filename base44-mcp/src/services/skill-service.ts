import type { Base44Client } from '../clients/base44-client.js';
import type { Env } from '../config/env.js';
import { ensureDestructiveAllowed } from '../config/permissions.js';
import { ok } from '../core/result.js';
import type { ToolResult } from '../core/types.js';
import type { AuditService } from './audit-service.js';

export class SkillService {
  constructor(
    private readonly client: Base44Client,
    private readonly env: Env,
    private readonly audit: AuditService
  ) {}

  async listSkills(): Promise<ToolResult> {
    return ok('Skills listed.', await this.client.listSkills());
  }

  async getSkill(input: { skillId: string }): Promise<ToolResult> {
    return ok('Skill resolved.', await this.client.getSkill(input));
  }

  async createSkill(input: Record<string, unknown>): Promise<ToolResult> {
    const data = await this.client.createSkill(input);
    this.audit.recordMutation('create_skill', 'skill.create', input);
    return ok('Skill created.', data);
  }

  async updateSkill(input: Record<string, unknown>): Promise<ToolResult> {
    const data = await this.client.updateSkill(input);
    this.audit.recordMutation('update_skill', 'skill.update', input);
    return ok('Skill updated.', data);
  }

  async deleteSkill(input: { skillId: string; confirmDangerous?: boolean }): Promise<ToolResult> {
    ensureDestructiveAllowed(this.env, input.confirmDangerous);
    const data = await this.client.deleteSkill({ skillId: input.skillId });
    this.audit.recordMutation('delete_skill', 'skill.delete', { skillId: input.skillId });
    return ok('Skill deleted.', data);
  }
}
