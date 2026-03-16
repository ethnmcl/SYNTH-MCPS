import { defineTool } from "./_base.js";

export const getTodayNoteTool = defineTool({
  name: "get_today_note",
  description: "Get today's daily note if it exists.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
  },
  async execute(ctx) {
    return ctx.services.dailyNoteService.getTodayNote(new Date());
  },
});
