import { defineTool, ensureBoolean, ensureString } from "./_base.js";

export const createNoteFromTemplateTool = defineTool({
  name: "create_note_from_template",
  description: "Create a note from a template with variable substitution.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: {
      template: { type: "string" },
      title: { type: "string" },
      folder: { type: "string" },
      variables: { type: "object", additionalProperties: { type: "string" } },
      overwrite: { type: "boolean", default: false },
    },
    required: ["template", "title"],
    additionalProperties: false,
  },
  async execute(ctx, input) {
    return ctx.services.templateService.createFromTemplate({
      template: ensureString(input.template, "template"),
      title: ensureString(input.title, "title"),
      folder: typeof input.folder === "string" ? input.folder : undefined,
      variables: typeof input.variables === "object" && input.variables ? (input.variables as Record<string, string>) : undefined,
      overwrite: ensureBoolean(input.overwrite, false),
    });
  },
});
