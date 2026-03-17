import { describe, expect, it } from "vitest";
import type { AppConfig } from "../../config/appConfig.js";
import { PolicyEngine } from "../../policy/policyEngine.js";
import { phase2Tools } from "../../mcp/tools/phase2/index.js";
import type { AppContext } from "../../mcp/types.js";

function createMockContext(): AppContext {
  const config: AppConfig = {
    nodeEnv: "test",
    logLevel: "info",
    server: { name: "render-mcp", version: "1.0.0" },
    render: {
      apiKey: "x",
      baseUrl: "https://api.render.com/v1",
      requestTimeoutMs: 1000,
      retryAttempts: 0,
      retryBaseDelayMs: 100
    },
    safety: {
      readOnlyMode: false,
      requireApprovalForDestructive: false,
      allowSecretValueRead: false,
      prodEnvNames: ["production"],
      prodServiceAllowlist: [],
      approvalToken: "approved"
    },
    audit: {
      path: "./logs/audit.log"
    }
  };

  return {
    config,
    logger: {
      info: () => undefined,
      error: () => undefined,
      warn: () => undefined,
      debug: () => undefined,
      fatal: () => undefined,
      trace: () => undefined,
      child: () => ({})
    } as never,
    auditLogger: {
      write: async () => undefined
    } as never,
    policyEngine: new PolicyEngine(config),
    render: {
      triggerDeploy: async () => ({ id: "dep-1", serviceId: "svc", status: "created" })
    } as never
  };
}

describe("phase2 tool handlers", () => {
  it("supports dry-run on trigger_deploy", async () => {
    const tool = phase2Tools.find((item) => item.name === "trigger_deploy");
    expect(tool).toBeDefined();

    const result = await tool!.handler(createMockContext(), {
      serviceId: "svc-1",
      clearCache: false,
      dryRun: true,
      approvalToken: "",
      environmentName: undefined,
      serviceNameOrId: undefined
    });

    expect((result as { summary: string }).summary).toContain("Dry run");
  });
});
