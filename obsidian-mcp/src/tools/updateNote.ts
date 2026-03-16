import { defineTool, ensureString } from "./_base.js";

export const updateNoteTool = defineTool({
  name: "update_note",
  description: "Replace the full content of a note safely.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: {
      note: { type: "string" },
      content: { type: "string" },
      frontmatter: { type: "object" },
    },
    required: ["note", "content"],
    additionalProperties: false,
  },
  async execute(ctx, input) {
    return ctx.services.noteService.updateNote(
      ensureString(input.note, "note"),
      ensureString(input.content, "content"),
      typeof input.frontmatter === "object" && input.frontmatter ? (input.frontmatter as Record<string, unknown>) : undefined,
    );
  },
});
