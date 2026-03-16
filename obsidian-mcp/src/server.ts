import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { logger } from "./logger.js";
import { createMcpServer, createToolContext, logStartup, normalizeError } from "./createServer.js";

async function main(): Promise<void> {
  const context = await createToolContext();
  const server = createMcpServer(context);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  logStartup(context.config, "stdio");

  const shutdown = async (signal: string) => {
    logger.info("shutdown_signal", { signal });
    await server.close();
    process.exit(0);
  };

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });
  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}

main().catch((error) => {
  const normalized = normalizeError(error);
  logger.error("startup_failed", normalized);
  process.exit(1);
});
