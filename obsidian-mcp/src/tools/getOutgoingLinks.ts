import { defineTool, ensureString } from "./_base.js";

export const getOutgoingLinksTool = defineTool({
  name: "get_outgoing_links",
  description: "List outgoing wiki and markdown links from a note.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: { note: { type: "string" } },
    required: ["note"],
    additionalProperties: false,
  },
  async execute(ctx, input) {
    return ctx.services.graphService.getOutgoingLinks(ensureString(input.note, "note"));
  },
});
