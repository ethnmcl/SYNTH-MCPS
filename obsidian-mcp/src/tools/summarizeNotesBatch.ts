import { defineTool, ensureBoolean, toArrayOfStrings } from "./_base.js";

export const summarizeNotesBatchTool = defineTool({
  name: "summarize_notes_batch",
  description: "Summarize multiple notes and optionally generate a combined synthesis.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: {
      notes: { type: "array", items: { type: "string" }, minItems: 1 },
      synthesize: { type: "boolean", default: true },
    },
    required: ["notes"],
    additionalProperties: false,
  },
  async execute(ctx, input) {
    const notes = toArrayOfStrings(input.notes);
    const summaries = [] as Array<{ note: string; summary: string }>;

    for (const noteRef of notes) {
      const note = await ctx.services.noteService.parseNote(noteRef);
      const lines = note.content
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 6)
        .join(" ");
      summaries.push({ note: note.path, summary: lines });
    }

    const synthesize = ensureBoolean(input.synthesize, true);
    return {
      summaries,
      synthesis: synthesize ? summaries.map((s) => `- ${s.note}: ${s.summary}`).join("\n") : null,
    };
  },
});
