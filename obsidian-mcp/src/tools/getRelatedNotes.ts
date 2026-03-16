import { defineTool, ensureNumber, ensureString } from "./_base.js";

export const getRelatedNotesTool = defineTool({
  name: "get_related_notes",
  description: "Combine backlinks, outgoing links, and shared tags into a related-note ranking.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: {
      note: { type: "string" },
      limit: { type: "integer", minimum: 1, maximum: 50, default: 12 },
    },
    required: ["note"],
    additionalProperties: false,
  },
  async execute(ctx, input) {
    return {
      note: ensureString(input.note, "note"),
      related: await ctx.services.graphService.getRelatedNotes(
        ensureString(input.note, "note"),
        ensureNumber(input.limit, 12),
      ),
    };
  },
});
