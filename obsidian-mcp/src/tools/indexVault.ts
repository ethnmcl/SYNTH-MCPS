import { defineTool } from "./_base.js";

export const indexVaultTool = defineTool({
  name: "index_vault",
  description: "Rebuild the semantic index for all notes in the vault.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
  },
  async execute(ctx) {
    return ctx.services.indexerService.indexVault();
  },
});
