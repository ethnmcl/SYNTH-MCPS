import type { Base44Client } from '../clients/base44-client.js';
import type { Env } from '../config/env.js';
import { ensureDestructiveAllowed } from '../config/permissions.js';
import { ok } from '../core/result.js';
import type { ToolResult } from '../core/types.js';
import { readTemplate } from '../utils/templates.js';
import type { AuditService } from './audit-service.js';

export class FunctionService {
  constructor(
    private readonly client: Base44Client,
    private readonly env: Env,
    private readonly audit: AuditService
  ) {}

  async listFunctions(input: Record<string, unknown>): Promise<ToolResult> {
    return ok('Functions listed.', await this.client.listFunctions(input));
  }

  async getFunction(input: { functionId: string }): Promise<ToolResult> {
    return ok('Function resolved.', await this.client.getFunction(input));
  }

  async createFunction(input: Record<string, unknown>): Promise<ToolResult> {
    const data = await this.client.createFunction(input);
    this.audit.recordMutation('create_function', 'function.create', input);
    return ok('Function created.', data);
  }

  async updateFunction(input: Record<string, unknown>): Promise<ToolResult> {
    const data = await this.client.updateFunction(input);
    this.audit.recordMutation('update_function', 'function.update', input);
    return ok('Function updated.', data);
  }

  async deleteFunction(input: { functionId: string; confirmDangerous?: boolean }): Promise<ToolResult> {
    ensureDestructiveAllowed(this.env, input.confirmDangerous);
    const data = await this.client.deleteFunction({ functionId: input.functionId });
    this.audit.recordMutation('delete_function', 'function.delete', { functionId: input.functionId });
    return ok('Function deleted.', data);
  }

  async runFunctionLocal(input: { functionName: string; payload?: Record<string, unknown> }): Promise<ToolResult> {
    this.audit.recordMutation('run_function_local', 'function.run_local', input);
    return ok('Function executed in local mock runtime.', {
      functionName: input.functionName,
      output: { ok: true, echo: input.payload ?? {} }
    });
  }

  async generateFunctionBoilerplate(input: { functionName: string }): Promise<ToolResult> {
    const template = await readTemplate('function.template.ts');
    const content = template.replaceAll('{{functionName}}', input.functionName);
    this.audit.recordMutation('generate_function_boilerplate', 'function.generate_boilerplate', input);
    return ok('Function boilerplate generated.', { functionName: input.functionName, content });
  }
}
