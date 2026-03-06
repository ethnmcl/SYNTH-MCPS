import type { IncomingMessage, ServerResponse } from "node:http";
import vercelMcpHandler from "../src/http/vercel.js";

export default async function handler(
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse,
): Promise<void> {
  await vercelMcpHandler(req, res);
}
