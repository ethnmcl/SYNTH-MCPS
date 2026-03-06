import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { createServer } from "../server/createServer.js";
import { logger } from "../utils/logger.js";
import {
  runtimeConfigFromHeaders,
  summarizeRuntimeOverride,
  type CreateServerConfig,
  type RuntimeConfigOverride,
} from "../server/runtimeConfig.js";

interface HandlerRequest extends IncomingMessage {
  body?: unknown;
}

export interface CreateHttpHandlerOptions extends CreateServerConfig {
  extractRuntimeConfig?: (req: IncomingMessage) => RuntimeConfigOverride;
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

function mergeRuntimeConfig(
  base?: RuntimeConfigOverride,
  dynamic?: RuntimeConfigOverride,
): RuntimeConfigOverride | undefined {
  if (!base && !dynamic) return undefined;
  return {
    ...(base ?? {}),
    ...(dynamic ?? {}),
  };
}

export function createHttpHandler(options: CreateHttpHandlerOptions = {}) {
  const transports: Record<string, StreamableHTTPServerTransport> = {};

  return async function handleMcpHttpRequest(req: HandlerRequest, res: ServerResponse): Promise<void> {
    const sessionIdHeader = req.headers["mcp-session-id"];
    const sessionId = Array.isArray(sessionIdHeader) ? sessionIdHeader[0] : sessionIdHeader;

    try {
      const parsedBody = req.body ?? (req.method === "POST" ? await readJsonBody(req) : undefined);
      const dynamicRuntime =
        options.extractRuntimeConfig?.(req) ?? runtimeConfigFromHeaders(req.headers);

      let transport: StreamableHTTPServerTransport | undefined;

      if (sessionId && transports[sessionId]) {
        transport = transports[sessionId];
      } else if (!sessionId && req.method === "POST" && parsedBody && isInitializeRequest(parsedBody)) {
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (sid) => {
            transports[sid] = transport!;
          },
        });

        transport.onclose = () => {
          const sid = transport?.sessionId;
          if (sid && transports[sid]) {
            delete transports[sid];
          }
        };

        const runtimeConfig = mergeRuntimeConfig(options.runtimeConfig, dynamicRuntime);
        logger.info("http_runtime_config_initialized", {
          runtime: summarizeRuntimeOverride(runtimeConfig),
        });

        const server = createServer({
          ...options,
          runtimeConfig,
        });
        await server.connect(transport);
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
            error: {
              code: -32603,
              message: "Internal server error",
            },
            id: null,
          }),
        );
      }
    }
  };
}
