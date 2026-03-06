import fs from "node:fs/promises";
import path from "node:path";
import type { RequestContext } from "./context.js";
import { redactValue } from "../utils/redact.js";

export interface AuditRecord {
  timestamp: string;
  request_id: string;
  tool_name: string;
  actor: string;
  access_level: string;
  sanitized_input: unknown;
  status: "success" | "failure";
  error_message?: string;
}

export async function writeAudit(
  context: RequestContext,
  toolName: string,
  input: unknown,
  status: "success" | "failure",
  errorMessage?: string,
): Promise<void> {
  const file = context.env.mcpAuditLogPath;
  const record: AuditRecord = {
    timestamp: new Date().toISOString(),
    request_id: context.requestId,
    tool_name: toolName,
    actor: context.actor,
    access_level: context.env.mcpAccessLevel,
    sanitized_input: redactValue(input),
    status,
    ...(errorMessage ? { error_message: errorMessage } : {}),
  };

  const dir = path.dirname(file);
  await fs.mkdir(dir, { recursive: true });
  await fs.appendFile(file, `${JSON.stringify(record)}\n`, "utf8");
}
