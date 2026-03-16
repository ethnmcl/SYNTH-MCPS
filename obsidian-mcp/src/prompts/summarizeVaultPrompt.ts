import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ServiceContainer } from "../types.js";

export function registerSummarizeVaultPrompt(server: McpServer, services: ServiceContainer): void {
  server.registerPrompt(
    "summarize_vault_prompt",
    {
      description: "Prompt template to summarize vault themes, clusters, and likely gaps.",
    },
    async () => {
      const notes = await services.vaultService.listNoteMetadata();
      const preview = notes
        .slice(0, 20)
        .map((n) => `- ${n.path} | tags: ${n.tags.join(", ") || "none"}`)
        .join("\n");

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Summarize this vault and infer key knowledge areas.\n\n${preview}`,
            },
          },
        ],
      };
    },
  );
}
