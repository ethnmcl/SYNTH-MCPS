import { defineTool, ensureNumber, ensureString } from "./_base.js";

export const semanticSearchNotesTool = defineTool({
  name: "semantic_search_notes",
  description: "Semantic search over indexed note chunks via the configured embedding adapter.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: {
      query: { type: "string" },
      topK: { type: "integer", minimum: 1, maximum: 50, default: 10 },
    },
    required: ["query"],
    additionalProperties: false,
  },
  async execute(ctx, input) {
    return ctx.services.searchService.semanticSearch(
      ensureString(input.query, "query"),
      ensureNumber(input.topK, 10),
    );
  },
});
