import { defineTool, ensureString } from "./_base.js";

export const indexNoteTool = defineTool({
  name: "index_note",
  description: "Index a single note into the semantic search cache.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: { note: { type: "string" } },
    required: ["note"],
    additionalProperties: false,
  },
  async execute(ctx, input) {
    return ctx.services.indexerService.indexNote(ensureString(input.note, "note"));
  },
});
