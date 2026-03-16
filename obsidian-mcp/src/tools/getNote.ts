import { defineTool, ensureString } from "./_base.js";

export const getNoteTool = defineTool({
  name: "get_note",
  description: "Read a note with content, links, tags, headings, frontmatter, and metadata.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: { note: { type: "string" } },
    required: ["note"],
    additionalProperties: false,
  },
  async execute(ctx, input) {
    return ctx.services.noteService.parseNote(ensureString(input.note, "note"));
  },
});
