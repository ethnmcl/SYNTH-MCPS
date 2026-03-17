import { loadEnv } from "./env.js";

export interface AppConfig {
  nodeEnv: "development" | "test" | "production";
  logLevel: "fatal" | "error" | "warn" | "info" | "debug" | "trace";
  server: {
    name: string;
    version: string;
  };
  render: {
    apiKey: string;
    baseUrl: string;
    requestTimeoutMs: number;
    retryAttempts: number;
    retryBaseDelayMs: number;
  };
  safety: {
    readOnlyMode: boolean;
    requireApprovalForDestructive: boolean;
    allowSecretValueRead: boolean;
    prodEnvNames: string[];
    prodServiceAllowlist: string[];
    approvalToken: string;
  };
  audit: {
    path: string;
  };
}

export function createAppConfig(): AppConfig {
  const env = loadEnv();

  const splitCsv = (value: string): string[] =>
    value
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0);

  return {
    nodeEnv: env.NODE_ENV,
    logLevel: env.LOG_LEVEL,
    server: {
      name: env.MCP_SERVER_NAME,
      version: env.MCP_SERVER_VERSION
    },
    render: {
      apiKey: env.RENDER_API_KEY,
      baseUrl: env.RENDER_API_BASE_URL,
      requestTimeoutMs: env.REQUEST_TIMEOUT_MS,
      retryAttempts: env.RETRY_ATTEMPTS,
      retryBaseDelayMs: env.RETRY_BASE_DELAY_MS
    },
    safety: {
      readOnlyMode: env.READ_ONLY_MODE,
      requireApprovalForDestructive: env.REQUIRE_APPROVAL_FOR_DESTRUCTIVE,
      allowSecretValueRead: env.ALLOW_SECRET_VALUE_READ,
      prodEnvNames: splitCsv(env.PROD_ENV_NAMES).map((v) => v.toLowerCase()),
      prodServiceAllowlist: splitCsv(env.PROD_SERVICE_ALLOWLIST),
      approvalToken: env.APPROVAL_TOKEN
    },
    audit: {
      path: env.AUDIT_LOG_PATH
    }
  };
}
