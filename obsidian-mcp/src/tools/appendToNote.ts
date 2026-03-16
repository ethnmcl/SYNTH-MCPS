import { defineTool, ensureString } from "./_base.js";

export const appendToNoteTool = defineTool({
  name: "append_to_note",
  description: "Append text to the end of a note.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: { note: { type: "string" }, text: { type: "string" } },
    required: ["note", "text"],
    additionalProperties: false,
  },
  async execute(ctx, input) {
    return ctx.services.noteService.appendToNote(ensureString(input.note, "note"), ensureString(input.text, "text"), "append");
  },
});
