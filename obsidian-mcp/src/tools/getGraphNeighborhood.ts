import { defineTool, ensureNumber, ensureString } from "./_base.js";

export const getGraphNeighborhoodTool = defineTool({
  name: "get_graph_neighborhood",
  description: "Return graph nodes and edges up to a configurable depth around a note.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: {
      note: { type: "string" },
      depth: { type: "integer", minimum: 1, maximum: 4, default: 2 },
    },
    required: ["note"],
    additionalProperties: false,
  },
  async execute(ctx, input) {
    return ctx.services.graphService.getGraphNeighborhood(
      ensureString(input.note, "note"),
      ensureNumber(input.depth, 2),
    );
  },
});
