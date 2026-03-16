import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerResearchContextPrompt(server: McpServer): void {
  server.registerPrompt(
    "research_context_prompt",
    {
      description: "Prompt template for constructing research context from vault notes.",
    },
    async () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: "Build a concise research context from relevant notes. Include facts, contradictions, and suggested follow-up notes.",
          },
        },
      ],
    }),
  );
}
