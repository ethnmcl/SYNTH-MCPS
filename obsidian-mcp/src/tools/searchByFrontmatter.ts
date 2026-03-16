import { defineTool, ensureNumber, ensureString } from "./_base.js";

export const searchByFrontmatterTool = defineTool({
  name: "search_by_frontmatter",
  description: "Find notes where a frontmatter field equals the provided value.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: {
      field: { type: "string" },
      value: {},
      limit: { type: "integer", minimum: 1, maximum: 200, default: 50 },
    },
    required: ["field", "value"],
    additionalProperties: false,
  },
  async execute(ctx, input) {
    return {
      field: ensureString(input.field, "field"),
      value: input.value,
      results: await ctx.services.searchService.searchByFrontmatter(
        ensureString(input.field, "field"),
        input.value,
        ensureNumber(input.limit, 50),
      ),
    };
  },
});
