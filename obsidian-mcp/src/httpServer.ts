import { randomUUID } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { createMcpServer, createToolContext, logStartup, normalizeError } from "./createServer.js";
import { logger } from "./logger.js";

interface HandlerRequest extends IncomingMessage {
  body?: unknown;
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) return undefined;
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return undefined;

  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

async function main(): Promise<void> {
  const context = await createToolContext();
  const port = Number.parseInt(process.env.MCP_HTTP_PORT ?? "8787", 10);
  const host = process.env.MCP_HTTP_HOST ?? "127.0.0.1";

  const transports: Record<string, StreamableHTTPServerTransport> = {};

  const server = createServer(async (req: HandlerRequest, res: ServerResponse) => {
    const path = req.url?.split("?")[0] ?? "/";

    if (path === "/health") {
      res.statusCode = 200;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ ok: true, name: "obsidian-mcp", transport: "http" }));
      return;
    }

    if (path !== "/mcp") {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }

    const sessionIdHeader = req.headers["mcp-session-id"];
    const sessionId = Array.isArray(sessionIdHeader) ? sessionIdHeader[0] : sessionIdHeader;

    try {
      const parsedBody = req.body ?? (req.method === "POST" ? await readJsonBody(req) : undefined);
      let transport: StreamableHTTPServerTransport | undefined;

      if (sessionId && transports[sessionId]) {
        transport = transports[sessionId];
      } else if (!sessionId && req.method === "POST" && parsedBody && isInitializeRequest(parsedBody)) {
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (sid: string) => {
            transports[sid] = transport!;
          },
        });

        transport.onclose = () => {
          const sid = transport?.sessionId;
          if (sid && transports[sid]) {
            delete transports[sid];
          }
        };

        const mcpServer = createMcpServer(context);
        await mcpServer.connect(transport);
      } else {
        res.statusCode = 400;
        res.setHeader("content-type", "application/json");
        res.end(
          JSON.stringify({
            jsonrpc: "2.0",
            error: {
              code: -32000,
              message: "Bad Request: missing valid MCP session or initialize request",
            },
            id: null,
          }),
        );
        return;
      }

      await transport.handleRequest(req, res, parsedBody);
    } catch (error) {
      logger.error("http_transport_error", {
        error: error instanceof Error ? error.message : String(error),
      });

      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader("content-type", "application/json");
        res.end(
          JSON.stringify({
            jsonrpc: "2.0",
            error: { code: -32603, message: "Internal server error" },
            id: null,
          }),
        );
      }
    }
  });

  await new Promise<void>((resolve) => {
    server.listen(port, host, () => resolve());
  });

  logStartup(context.config, "http");
  logger.info("http_listening", {
    endpoint: `http://${host}:${port}/mcp`,
    health: `http://${host}:${port}/health`,
  });

  const shutdown = (signal: string) => {
    logger.info("shutdown_signal", { signal });
    server.close(() => process.exit(0));
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((error) => {
  const normalized = normalizeError(error);
  logger.error("startup_failed", normalized);
  process.exit(1);
});
