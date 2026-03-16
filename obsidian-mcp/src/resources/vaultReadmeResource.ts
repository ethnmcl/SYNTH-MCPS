import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ServiceContainer } from "../types.js";

export function registerVaultReadmeResource(server: McpServer, services: ServiceContainer): void {
  server.registerResource(
    "vault_readme",
    "obsidian://vault/readme",
    {
      title: "Vault Readme",
      description: "Quick vault overview for clients discovering this MCP server.",
      mimeType: "text/plain",
    },
    async () => {
      const [folders, notes] = await Promise.all([
        services.vaultService.listFolders(),
        services.vaultService.listNotePaths(),
      ]);

      const text = [
        "# Obsidian Vault Overview",
        "",
        `Notes: ${notes.length}`,
        `Folders: ${folders.length}`,
        "",
        "## Folders",
        ...folders.slice(0, 40).map((f) => `- ${f}`),
      ].join("\n");

      return {
        contents: [
          {
            uri: "obsidian://vault/readme",
            text,
          },
        ],
      };
    },
  );
}
