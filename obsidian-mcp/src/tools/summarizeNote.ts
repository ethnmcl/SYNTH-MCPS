import { defineTool, ensureString } from "./_base.js";

function summarize(content: string, maxSentences = 6): string[] {
  const lines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const headingLines = lines.filter((l) => l.startsWith("#")).slice(0, 3);
  const paragraphs = lines.filter((l) => !l.startsWith("#") && !l.startsWith("- ")).slice(0, maxSentences);
  return [...headingLines, ...paragraphs].slice(0, maxSentences);
}

export const summarizeNoteTool = defineTool({
  name: "summarize_note",
  description: "Create a local extractive summary for a single note without external LLM calls.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: {
      note: { type: "string" },
      maxSentences: { type: "integer", minimum: 1, maximum: 20, default: 6 },
    },
    required: ["note"],
    additionalProperties: false,
  },
  async execute(ctx, input) {
    const note = await ctx.services.noteService.parseNote(ensureString(input.note, "note"));
    const maxSentences = typeof input.maxSentences === "number" ? input.maxSentences : 6;
    const bullets = summarize(note.content, maxSentences);
    return { note: note.path, summary: bullets.join("\n"), bullets };
  },
});
