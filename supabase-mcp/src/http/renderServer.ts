import { createServer as createHttpServer } from "node:http";
import { createHttpHandler } from "./createHttpHandler.js";
import { logger } from "../utils/logger.js";

const portRaw = process.env.PORT ?? "3000";
const port = Number(portRaw);

if (!Number.isFinite(port) || port <= 0) {
  throw new Error(`Invalid PORT: ${portRaw}`);
}

const mcpHandler = createHttpHandler();

const server = createHttpServer(async (req, res) => {
  const method = req.method ?? "GET";
  const url = req.url ?? "/";

  if (method === "GET" && url === "/healthz") {
    res.statusCode = 200;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, service: "supabase-mcp" }));
    return;
  }

  if (url.startsWith("/mcp")) {
    await mcpHandler(req, res);
    return;
  }

  if (method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  res.statusCode = 404;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify({ error: "Not Found" }));
});

server.listen(port, () => {
  logger.info("supabase-mcp HTTP server started", { port, endpoint: "/mcp" });
});
