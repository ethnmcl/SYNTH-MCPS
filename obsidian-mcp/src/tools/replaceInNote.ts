import { defineTool, ensureBoolean, ensureString } from "./_base.js";

export const replaceInNoteTool = defineTool({
  name: "replace_in_note",
  description: "Replace text in a note using literal or regex mode.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: {
      note: { type: "string" },
      find: { type: "string" },
      replace: { type: "string" },
      regex: { type: "boolean", default: false },
    },
    required: ["note", "find", "replace"],
    additionalProperties: false,
  },
  async execute(ctx, input) {
    return ctx.services.noteService.replaceInNote(
      ensureString(input.note, "note"),
      ensureString(input.find, "find"),
      ensureString(input.replace, "replace"),
      ensureBoolean(input.regex, false),
    );
  },
});
