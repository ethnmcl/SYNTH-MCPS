import { describe, expect, it, beforeEach } from "vitest";
import { createAppConfig } from "../../config/appConfig.js";

describe("createAppConfig", () => {
  beforeEach(() => {
    process.env.RENDER_API_KEY = "test-key";
    process.env.RENDER_API_BASE_URL = "https://api.render.com/v1";
    process.env.NODE_ENV = "test";
    process.env.LOG_LEVEL = "debug";
    process.env.PROD_ENV_NAMES = "production,prod";
    process.env.PROD_SERVICE_ALLOWLIST = "svc-1,svc-2";
  });

  it("builds typed config from env", () => {
    const config = createAppConfig();
    expect(config.render.apiKey).toBe("test-key");
    expect(config.safety.prodEnvNames).toEqual(["production", "prod"]);
    expect(config.safety.prodServiceAllowlist).toEqual(["svc-1", "svc-2"]);
    expect(config.nodeEnv).toBe("test");
    expect(config.safety.readOnlyMode).toBe(false);
  });
});
