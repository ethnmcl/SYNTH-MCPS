import { defineTool, ensureNumber } from "./_base.js";

export const getRecentNotesTool = defineTool({
  name: "get_recent_notes",
  description: "Return the most recently modified notes.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: { limit: { type: "integer", minimum: 1, maximum: 200, default: 20 } },
    additionalProperties: false,
  },
  async execute(ctx, input) {
    const paths = await ctx.services.noteService.listRecent(ensureNumber(input.limit, 20));
    return {
      notes: await Promise.all(paths.map((p) => ctx.services.vaultService.noteMetadata(p))),
    };
  },
});
