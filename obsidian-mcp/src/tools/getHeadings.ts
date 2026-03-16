import { defineTool, ensureString } from "./_base.js";

export const getHeadingsTool = defineTool({
  name: "get_headings",
  description: "Return headings from a note including level and line number.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: { note: { type: "string" } },
    required: ["note"],
    additionalProperties: false,
  },
  async execute(ctx, input) {
    const note = await ctx.services.noteService.parseNote(ensureString(input.note, "note"));
    return { path: note.path, headings: note.headings };
  },
});
