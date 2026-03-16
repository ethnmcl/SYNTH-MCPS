import { defineTool, ensureBoolean, ensureString } from "./_base.js";

export const createNoteTool = defineTool({
  name: "create_note",
  description: "Create a note with optional folder, content, and frontmatter.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: {
      title: { type: "string" },
      folder: { type: "string" },
      content: { type: "string" },
      frontmatter: { type: "object" },
      overwrite: { type: "boolean", default: false },
    },
    required: ["title"],
    additionalProperties: false,
  },
  async execute(ctx, input) {
    return ctx.services.noteService.createNote({
      title: ensureString(input.title, "title"),
      folder: typeof input.folder === "string" ? input.folder : undefined,
      content: typeof input.content === "string" ? input.content : undefined,
      frontmatter: typeof input.frontmatter === "object" && input.frontmatter ? (input.frontmatter as Record<string, unknown>) : undefined,
      overwrite: ensureBoolean(input.overwrite, false),
    });
  },
});
