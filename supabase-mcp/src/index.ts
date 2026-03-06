import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server/createServer.js";
import { logger } from "./utils/logger.js";

async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info("supabase-mcp server started");
}

main().catch((error) => {
  logger.error("failed_to_start", { error: error instanceof Error ? error.message : String(error) });
  process.exit(1);
});
