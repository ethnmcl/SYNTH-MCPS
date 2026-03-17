import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { normalizeUnknownError } from "./lib/errors.js";
import { createAppContext, createMcpServer } from "./server/bootstrap.js";

async function main(): Promise<void> {
  const context = createAppContext();
  const server = createMcpServer(context);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  context.logger.info({
    event: "server_started",
    server: context.config.server.name,
    version: context.config.server.version,
    readOnlyMode: context.config.safety.readOnlyMode
  });

  const shutdown = async (signal: string): Promise<void> => {
    context.logger.info({ event: "shutdown_signal", signal });
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

main().catch((error: unknown) => {
  const normalized = normalizeUnknownError(error);
    console.error(
    JSON.stringify(
      {
        event: "startup_failed",
        code: normalized.code,
        message: normalized.message,
        details: normalized.details
      },
      null,
      2
    )
  );
  process.exit(1);
});
