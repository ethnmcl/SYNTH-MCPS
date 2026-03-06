import type { IncomingMessage, ServerResponse } from "node:http";
import { createHttpHandler } from "./createHttpHandler.js";

const handler = createHttpHandler();

export default async function vercelMcpHandler(
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse,
): Promise<void> {
  await handler(req, res);
}
