import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerPrompts as registerRenderPrompts } from "../mcp/prompts/index.js";

export function registerPrompts(server: McpServer): void {
  registerRenderPrompts(server);
}
