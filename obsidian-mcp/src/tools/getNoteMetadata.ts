import { defineTool, ensureString } from "./_base.js";

export const getNoteMetadataTool = defineTool({
  name: "get_note_metadata",
  description: "Get basic metadata for a note without returning full content.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: { note: { type: "string" } },
    required: ["note"],
    additionalProperties: false,
  },
  async execute(ctx, input) {
    const note = await ctx.services.noteService.parseNote(ensureString(input.note, "note"));
    return {
      path: note.path,
      title: note.title,
      basename: note.basename,
      sizeBytes: note.sizeBytes,
      createdAt: note.createdAt,
      modifiedAt: note.modifiedAt,
      tags: note.tags,
    };
  },
});
