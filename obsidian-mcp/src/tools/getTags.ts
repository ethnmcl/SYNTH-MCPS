import { defineTool } from "./_base.js";

export const getTagsTool = defineTool({
  name: "get_tags",
  description: "Aggregate all tags across the vault with counts.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
  },
  async execute(ctx) {
    const notes = await ctx.services.vaultService.listNoteMetadata();
    const counts = new Map<string, number>();
    for (const note of notes) {
      for (const tag of note.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return {
      tags: [...counts.entries()]
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count),
    };
  },
});
