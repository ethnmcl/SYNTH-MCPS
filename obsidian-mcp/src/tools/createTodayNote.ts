import { defineTool, ensureString } from "./_base.js";

export const createTodayNoteTool = defineTool({
  name: "create_today_note",
  description: "Create today's daily note (YYYY-MM-DD.md) if it does not exist.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: {
      content: { type: "string" },
      date: { type: "string", format: "date" },
      frontmatter: { type: "object" },
    },
    additionalProperties: false,
  },
  async execute(ctx, input) {
    return ctx.services.dailyNoteService.createTodayNote({
      content: typeof input.content === "string" ? input.content : undefined,
      date: typeof input.date === "string" ? ensureString(input.date, "date") : undefined,
      frontmatter: typeof input.frontmatter === "object" && input.frontmatter ? (input.frontmatter as Record<string, unknown>) : undefined,
    });
  },
});
