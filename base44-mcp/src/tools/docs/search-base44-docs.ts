import type { ToolDefinition } from '../../core/types.js';
import { searchBase44DocsInputSchema } from '../../schemas/docs.js';

export const search_base44_docsTool: ToolDefinition<typeof searchBase44DocsInputSchema> = {
  name: 'search_base44_docs',
  description: 'Search Base44 documentation content by query string.',
  inputSchema: searchBase44DocsInputSchema,
  async execute(ctx, input) {
    return ctx.services.docsService.searchBase44Docs(input as never);
  }
};
