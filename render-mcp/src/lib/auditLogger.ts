import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import type pino from "pino";
import { redactObject } from "./redact.js";

export interface AuditEntry {
  actor: string;
  tool: string;
  action: string;
  timestamp: string;
  arguments: Record<string, unknown>;
  result: Record<string, unknown>;
  status: "success" | "failure";
}

export class AuditLogger {
  public constructor(
    private readonly path: string,
    private readonly logger: pino.Logger
  ) {}

  public async write(entry: AuditEntry): Promise<void> {
    await mkdir(dirname(this.path), { recursive: true });
    const safeEntry = {
      ...entry,
      arguments: redactObject(entry.arguments),
      result: redactObject(entry.result)
    };
    await appendFile(this.path, `${JSON.stringify(safeEntry)}\n`, "utf-8");
    this.logger.info({ event: "audit_entry_written", tool: entry.tool, status: entry.status });
  }
}
