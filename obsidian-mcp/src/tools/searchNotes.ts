import { defineTool, ensureBoolean, ensureNumber, ensureString } from "./_base.js";

export const searchNotesTool = defineTool({
  name: "search_notes",
  description: "Keyword, substring, or regex search across title/content/tags/frontmatter.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: {
      query: { type: "string" },
      regex: { type: "boolean", default: false },
      limit: { type: "integer", minimum: 1, maximum: 200, default: 20 },
    },
    required: ["query"],
    additionalProperties: false,
  },
  async execute(ctx, input) {
    const query = ensureString(input.query, "query");
    const results = await ctx.services.searchService.keywordSearch(query, {
      regex: ensureBoolean(input.regex, false),
      limit: ensureNumber(input.limit, 20),
    });
    return { query, results };
  },
});
