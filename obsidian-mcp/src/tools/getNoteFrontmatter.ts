import { defineTool, ensureString } from "./_base.js";

export const getNoteFrontmatterTool = defineTool({
  name: "get_note_frontmatter",
  description: "Get YAML frontmatter object for a note.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: { note: { type: "string" } },
    required: ["note"],
    additionalProperties: false,
  },
  async execute(ctx, input) {
    const note = await ctx.services.noteService.parseNote(ensureString(input.note, "note"));
    return { path: note.path, frontmatter: note.frontmatter };
  },
});
