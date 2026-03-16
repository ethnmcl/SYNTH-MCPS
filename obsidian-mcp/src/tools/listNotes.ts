import { ensureNumber, ensureString, defineTool } from "./_base.js";

export const listNotesTool = defineTool({
  name: "list_notes",
  description: "List notes with optional folder/tag filtering and pagination.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: {
      folder: { type: "string" },
      tag: { type: "string" },
      limit: { type: "integer", minimum: 1, maximum: 1000, default: 100 },
      offset: { type: "integer", minimum: 0, default: 0 },
      sortBy: { type: "string", enum: ["name", "modified", "created"], default: "name" },
    },
    additionalProperties: false,
  },
  async execute(ctx, input) {
    const folder = typeof input.folder === "string" ? ensureString(input.folder, "folder") : undefined;
    const tag = typeof input.tag === "string" ? input.tag.replace(/^#/, "").toLowerCase() : undefined;
    const limit = ensureNumber(input.limit, 100);
    const offset = ensureNumber(input.offset, 0);
    const sortBy = (typeof input.sortBy === "string" ? input.sortBy : "name") as "name" | "modified" | "created";

    let notes = await ctx.services.vaultService.listNoteMetadata();
    if (folder) notes = notes.filter((n) => n.path.startsWith(`${folder}/`) || n.path === folder);
    if (tag) notes = notes.filter((n) => n.tags.includes(tag));

    notes.sort((a, b) => {
      if (sortBy === "modified") return b.modifiedAt.localeCompare(a.modifiedAt);
      if (sortBy === "created") return b.createdAt.localeCompare(a.createdAt);
      return a.path.localeCompare(b.path);
    });

    return {
      total: notes.length,
      limit,
      offset,
      notes: notes.slice(offset, offset + limit),
    };
  },
});
