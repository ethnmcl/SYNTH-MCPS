import { defineTool, ensureString } from "./_base.js";

export const prependToNoteTool = defineTool({
  name: "prepend_to_note",
  description: "Prepend text to the beginning of a note.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: { note: { type: "string" }, text: { type: "string" } },
    required: ["note", "text"],
    additionalProperties: false,
  },
  async execute(ctx, input) {
    return ctx.services.noteService.appendToNote(ensureString(input.note, "note"), ensureString(input.text, "text"), "prepend");
  },
});
