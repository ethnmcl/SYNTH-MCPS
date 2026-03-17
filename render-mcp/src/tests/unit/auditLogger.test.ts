import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import pino from "pino";
import { AuditLogger } from "../../lib/auditLogger.js";

let tempPath = "";

afterEach(async () => {
  if (tempPath) {
    await rm(tempPath, { recursive: true, force: true });
    tempPath = "";
  }
});

describe("AuditLogger", () => {
  it("writes redacted audit entries", async () => {
    tempPath = await mkdtemp(join(tmpdir(), "render-mcp-test-"));
    const logPath = join(tempPath, "audit.log");
    const logger = pino({ enabled: false });
    const audit = new AuditLogger(logPath, logger);

    await audit.write({
      actor: "test",
      tool: "update_env_var",
      action: "update_env_var",
      timestamp: new Date().toISOString(),
      arguments: { value: "supersecret" },
      result: { status: "ok" },
      status: "success"
    });

    const content = await readFile(logPath, "utf-8");
    expect(content).toContain("***");
    expect(content).not.toContain("supersecret");
  });
});
