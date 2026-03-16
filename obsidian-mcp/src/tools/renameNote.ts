import { defineTool, ensureString } from "./_base.js";

export const renameNoteTool = defineTool({
  name: "rename_note",
  description: "Rename a note while preserving location and extension safety.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: { note: { type: "string" }, newName: { type: "string" } },
    required: ["note", "newName"],
    additionalProperties: false,
  },
  async execute(ctx, input) {
    return ctx.services.noteService.renameNote(ensureString(input.note, "note"), ensureString(input.newName, "newName"));
  },
});
