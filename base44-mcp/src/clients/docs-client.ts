import type { Env } from '../config/env.js';

const docs = [
  {
    id: 'entities-overview',
    title: 'Entities Overview',
    url: '/entities/overview',
    body: 'Entities define typed data models, fields, and validation behavior in Base44 backend projects.'
  },
  {
    id: 'functions-runtime',
    title: 'Functions Runtime',
    url: '/functions/runtime',
    body: 'Functions provide backend logic for triggers, APIs, jobs, and orchestration.'
  },
  {
    id: 'integrations-openapi',
    title: 'OpenAPI Integrations',
    url: '/integrations/openapi',
    body: 'Workspace integrations can be generated from OpenAPI specs and configured with secret references.'
  }
] as const;

export class DocsClient {
  constructor(private readonly env: Env) {}

  async search(query: string): Promise<Array<Record<string, unknown>>> {
    const q = query.toLowerCase();
    return docs
      .filter((d) => d.title.toLowerCase().includes(q) || d.body.toLowerCase().includes(q))
      .map((d) => ({ ...d, absoluteUrl: this.env.BASE44_DOCS_BASE_URL + d.url }));
  }

  async getPage(pageId: string): Promise<Record<string, unknown>> {
    const page = docs.find((d) => d.id === pageId);
    if (!page) {
      return { id: pageId, missing: true };
    }
    return { ...page, absoluteUrl: this.env.BASE44_DOCS_BASE_URL + page.url };
  }
}
