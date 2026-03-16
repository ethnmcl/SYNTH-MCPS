import { defineTool, ensureString } from "./_base.js";

export const getBacklinksTool = defineTool({
  name: "get_backlinks",
  description: "Find backlinks to a target note.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: { note: { type: "string" } },
    required: ["note"],
    additionalProperties: false,
  },
  async execute(ctx, input) {
    return ctx.services.graphService.getBacklinks(ensureString(input.note, "note"));
  },
});
