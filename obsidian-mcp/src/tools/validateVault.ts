import path from "node:path";
import { defineTool } from "./_base.js";

export const validateVaultTool = defineTool({
  name: "validate_vault",
  description: "Run vault health checks for broken links, duplicate basenames, size limits, and malformed frontmatter.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
  },
  async execute(ctx) {
    const notePaths = await ctx.services.vaultService.listNotePaths();
    const brokenLinks: Array<{ source: string; target: string }> = [];
    const duplicateBasenames = new Map<string, string[]>();
    const oversized: Array<{ path: string; sizeBytes: number; maxBytes: number }> = [];
    const malformedFrontmatter: Array<{ path: string; error: string }> = [];
    const unresolvedTemplateRefs: Array<{ path: string; template: string }> = [];

    for (const notePath of notePaths) {
      try {
        const note = await ctx.services.noteService.parseNote(notePath);
        if (note.sizeBytes > ctx.config.maxFileSizeBytes) {
          oversized.push({ path: note.path, sizeBytes: note.sizeBytes, maxBytes: ctx.config.maxFileSizeBytes });
        }

        for (const link of note.links) {
          try {
            await ctx.services.vaultService.resolveNoteReference(link.target);
          } catch {
            brokenLinks.push({ source: note.path, target: link.target });
          }
        }

        const basename = path.basename(note.path, ctx.config.defaultNoteExtension).toLowerCase();
        const arr = duplicateBasenames.get(basename) ?? [];
        arr.push(note.path);
        duplicateBasenames.set(basename, arr);

        const template = note.frontmatter.template;
        if (typeof template === "string") {
          try {
            await ctx.services.templateService.loadTemplate(template);
          } catch {
            unresolvedTemplateRefs.push({ path: note.path, template });
          }
        }
      } catch (error) {
        malformedFrontmatter.push({
          path: notePath,
          error: error instanceof Error ? error.message : "Unknown parse error",
        });
      }
    }

    const duplicateList = [...duplicateBasenames.entries()]
      .filter(([, paths]) => paths.length > 1)
      .map(([basename, paths]) => ({ basename, paths }));

    const ok =
      brokenLinks.length === 0 &&
      duplicateList.length === 0 &&
      oversized.length === 0 &&
      malformedFrontmatter.length === 0 &&
      unresolvedTemplateRefs.length === 0;

    return {
      ok,
      checkedNotes: notePaths.length,
      brokenLinks,
      duplicateBasenames: duplicateList,
      oversizedNotes: oversized,
      malformedFrontmatter,
      unresolvedTemplateRefs,
    };
  },
});
