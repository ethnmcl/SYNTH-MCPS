import { describe, expect, it } from "vitest";
import { PolicyError } from "../../lib/errors.js";
import { PolicyEngine } from "../../policy/policyEngine.js";
import type { AppConfig } from "../../config/appConfig.js";

const baseConfig: AppConfig = {
  nodeEnv: "test",
  logLevel: "info",
  server: { name: "render-mcp", version: "1.0.0" },
  render: {
    apiKey: "key",
    baseUrl: "https://api.render.com/v1",
    requestTimeoutMs: 1000,
    retryAttempts: 1,
    retryBaseDelayMs: 100
  },
  safety: {
    readOnlyMode: false,
    requireApprovalForDestructive: true,
    allowSecretValueRead: false,
    prodEnvNames: ["production", "prod"],
    prodServiceAllowlist: ["svc-safe"],
    approvalToken: "approved"
  },
  audit: {
    path: "./logs/audit.log"
  }
};

describe("PolicyEngine", () => {
  it("allows non-mutating tools", () => {
    const engine = new PolicyEngine(baseConfig);
    expect(() => engine.check({ toolName: "list_services", mutating: false, destructive: false })).not.toThrow();
  });

  it("blocks writes in read only mode", () => {
    const engine = new PolicyEngine({
      ...baseConfig,
      safety: { ...baseConfig.safety, readOnlyMode: true }
    });

    expect(() =>
      engine.check({ toolName: "trigger_deploy", mutating: true, destructive: false })
    ).toThrow(PolicyError);
  });

  it("requires approval token for destructive action", () => {
    const engine = new PolicyEngine(baseConfig);
    expect(() =>
      engine.check({
        toolName: "restart_service",
        mutating: true,
        destructive: true,
        approvalToken: "wrong"
      })
    ).toThrow(PolicyError);
  });
});
