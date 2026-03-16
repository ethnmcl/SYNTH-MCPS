import { defineTool, ensureNumber } from "./_base.js";

export const listDailyNotesTool = defineTool({
  name: "list_daily_notes",
  description: "List daily notes from the configured daily notes folder.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: { limit: { type: "integer", minimum: 1, maximum: 365, default: 30 } },
    additionalProperties: false,
  },
  async execute(ctx, input) {
    return { notes: await ctx.services.dailyNoteService.listDailyNotes(ensureNumber(input.limit, 30)) };
  },
});
