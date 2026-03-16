import { defineTool } from "./_base.js";

export const listTemplatesTool = defineTool({
  name: "list_templates",
  description: "List available note templates in the templates folder.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
  },
  async execute(ctx) {
    return { templates: await ctx.services.templateService.listTemplates() };
  },
});
