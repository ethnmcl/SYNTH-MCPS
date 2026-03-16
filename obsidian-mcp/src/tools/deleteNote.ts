import { defineTool, ensureBoolean, ensureString } from "./_base.js";

export const deleteNoteTool = defineTool({
  name: "delete_note",
  description: "Delete a note. Soft delete to trash by default; permanent delete requires explicit flag.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: {
      note: { type: "string" },
      permanent: { type: "boolean", default: false },
    },
    required: ["note"],
    additionalProperties: false,
  },
  async execute(ctx, input) {
    return ctx.services.noteService.deleteNote(ensureString(input.note, "note"), {
      permanent: ensureBoolean(input.permanent, false),
    });
  },
});
