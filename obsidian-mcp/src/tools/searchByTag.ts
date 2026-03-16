import { defineTool, ensureNumber, ensureString } from "./_base.js";

export const searchByTagTool = defineTool({
  name: "search_by_tag",
  description: "Search notes by normalized tag (with or without #).",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: {
      tag: { type: "string" },
      limit: { type: "integer", minimum: 1, maximum: 200, default: 50 },
    },
    required: ["tag"],
    additionalProperties: false,
  },
  async execute(ctx, input) {
    const tag = ensureString(input.tag, "tag");
    return {
      tag,
      results: await ctx.services.searchService.searchByTag(tag, ensureNumber(input.limit, 50)),
    };
  },
});
