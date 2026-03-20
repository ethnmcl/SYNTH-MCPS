import type { Base44Client } from '../clients/base44-client.js';
import type { Env } from '../config/env.js';
import { ensureDestructiveAllowed } from '../config/permissions.js';
import { ok } from '../core/result.js';
import type { ToolResult } from '../core/types.js';
import type { AuditService } from './audit-service.js';

export class EntityService {
  constructor(
    private readonly client: Base44Client,
    private readonly env: Env,
    private readonly audit: AuditService
  ) {}

  async listEntities(input: Record<string, unknown>): Promise<ToolResult> {
    return ok('Entities listed.', await this.client.listEntities(input));
  }

  async getEntity(input: { entityId: string }): Promise<ToolResult> {
    return ok('Entity resolved.', await this.client.getEntity(input));
  }

  async createEntity(input: Record<string, unknown>): Promise<ToolResult> {
    const data = await this.client.createEntity(input);
    this.audit.recordMutation('create_entity', 'entity.create', input);
    return ok('Entity created.', data);
  }

  async updateEntity(input: Record<string, unknown>): Promise<ToolResult> {
    const data = await this.client.updateEntity(input);
    this.audit.recordMutation('update_entity', 'entity.update', input);
    return ok('Entity updated.', data);
  }

  async deleteEntity(input: { entityId: string; confirmDangerous?: boolean }): Promise<ToolResult> {
    ensureDestructiveAllowed(this.env, input.confirmDangerous);
    const data = await this.client.deleteEntity({ entityId: input.entityId });
    this.audit.recordMutation('delete_entity', 'entity.delete', { entityId: input.entityId });
    return ok('Entity deleted.', data);
  }

  async validateEntitySchema(input: { schema: Record<string, unknown> }): Promise<ToolResult> {
    const hasFields = typeof input.schema.fields === 'object' && input.schema.fields !== null;
    return ok('Entity schema validated.', { valid: hasFields, issues: hasFields ? [] : ['schema.fields is required'] });
  }

  async generateEntityFromJson(input: { name: string; jsonExample: Record<string, unknown> }): Promise<ToolResult> {
    const fields = Object.entries(input.jsonExample).reduce<Record<string, string>>((acc, [k, v]) => {
      acc[k] = Array.isArray(v) ? 'array' : typeof v;
      return acc;
    }, {});
    const data = { name: input.name, schema: { fields } };
    this.audit.recordMutation('generate_entity_from_json', 'entity.generate', data);
    return ok('Generated entity schema from JSON sample.', data);
  }
}
