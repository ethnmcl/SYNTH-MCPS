import { defineTool, ensureBoolean, toArrayOfStrings } from "./_base.js";

export const bulkDeleteNotesTool = defineTool({
  name: "bulk_delete_notes",
  description: "Delete multiple notes in one call. Uses soft delete by default.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: {
      notes: { type: "array", items: { type: "string" }, minItems: 1 },
      permanent: { type: "boolean", default: false },
    },
    required: ["notes"],
    additionalProperties: false,
  },
  async execute(ctx, input) {
    return {
      results: await ctx.services.noteService.bulkDeleteNotes(toArrayOfStrings(input.notes), {
        permanent: ensureBoolean(input.permanent, false),
      }),
    };
  },
});
