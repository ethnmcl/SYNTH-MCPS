import type { ToolDefinition } from '../../core/types.js';
import { getDocPageInputSchema } from '../../schemas/docs.js';

export const get_doc_pageTool: ToolDefinition<typeof getDocPageInputSchema> = {
  name: 'get_doc_page',
  description: 'Fetch one documentation page by page ID.',
  inputSchema: getDocPageInputSchema,
  async execute(ctx, input) {
    return ctx.services.docsService.getDocPage(input as never);
  }
};
