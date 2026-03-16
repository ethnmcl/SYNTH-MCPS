import { defineTool, ensureString } from "./_base.js";

export const generateOutlineTool = defineTool({
  name: "generate_outline",
  description: "Generate hierarchical outline from note headings and leading bullets.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: { note: { type: "string" } },
    required: ["note"],
    additionalProperties: false,
  },
  async execute(ctx, input) {
    const note = await ctx.services.noteService.parseNote(ensureString(input.note, "note"));
    const keyBullets = note.content
      .split(/\r?\n/)
      .filter((line) => line.trim().startsWith("- "))
      .slice(0, 12)
      .map((line) => line.trim());

    return {
      note: note.path,
      headings: note.headings,
      keyBullets,
    };
  },
});
