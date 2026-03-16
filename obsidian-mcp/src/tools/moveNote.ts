import { defineTool, ensureString } from "./_base.js";

export const moveNoteTool = defineTool({
  name: "move_note",
  description: "Move a note into another folder inside the vault.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: { note: { type: "string" }, destinationFolder: { type: "string" } },
    required: ["note", "destinationFolder"],
    additionalProperties: false,
  },
  async execute(ctx, input) {
    return ctx.services.noteService.moveNote(
      ensureString(input.note, "note"),
      ensureString(input.destinationFolder, "destinationFolder"),
    );
  },
});
