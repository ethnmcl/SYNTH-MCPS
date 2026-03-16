import { defineTool } from "./_base.js";

export const listVaultInfoTool = defineTool({
  name: "list_vault_info",
  description: "Return vault-level summary stats and server safety settings.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
  },
  async execute(ctx) {
    return ctx.services.vaultService.getVaultInfo(
      ctx.services.indexerService.getLastIndexedAt(),
      ctx.config.enableSemanticSearch,
    );
  },
});
