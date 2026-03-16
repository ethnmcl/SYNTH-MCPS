import { defineTool, ensureNumber, ensureString } from "./_base.js";

export const autoLinkSuggestionsTool = defineTool({
  name: "auto_link_suggestions",
  description: "Suggest candidate internal links based on title-token matches.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: {
      note: { type: "string" },
      limit: { type: "integer", minimum: 1, maximum: 30, default: 10 },
    },
    required: ["note"],
    additionalProperties: false,
  },
  async execute(ctx, input) {
    return {
      note: ensureString(input.note, "note"),
      suggestions: await ctx.services.graphService.autoLinkSuggestions(
        ensureString(input.note, "note"),
        ensureNumber(input.limit, 10),
      ),
    };
  },
});
