import type { DocsClient } from '../clients/docs-client.js';
import { ok } from '../core/result.js';
import type { ToolResult } from '../core/types.js';

export class DocsService {
  constructor(private readonly docsClient: DocsClient) {}

  async searchBase44Docs(input: { query: string }): Promise<ToolResult> {
    return ok('Docs search complete.', { query: input.query, items: await this.docsClient.search(input.query) });
  }

  async getDocPage(input: { pageId: string }): Promise<ToolResult> {
    return ok('Doc page retrieved.', await this.docsClient.getPage(input.pageId));
  }

  async recommendNextSteps(input: { topic: string }): Promise<ToolResult> {
    return ok('Generated next-step recommendations.', {
      topic: input.topic,
      recommendations: [
        'Model entities and validation rules first.',
        'Generate function boilerplate for backend logic.',
        'Configure integrations and connectors before deployment.',
        'Run validate_project_structure before sync/deploy.'
      ]
    });
  }
}
