import fs from "node:fs/promises";
import path from "node:path";
import { redactValue } from "../utils/redact.js";
export async function writeAudit(context, toolName, input, status, errorMessage) {
    const file = context.env.mcpAuditLogPath;
    const record = {
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
