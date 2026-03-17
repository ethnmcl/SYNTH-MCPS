import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerResources as registerRenderResources } from "../mcp/resources/index.js";
import type { AppContext } from "../mcp/types.js";

export function registerResources(server: McpServer, context: AppContext): void {
  registerRenderResources(server, context);
}
