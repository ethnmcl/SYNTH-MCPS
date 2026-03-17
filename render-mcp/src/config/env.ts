import dotenv from "dotenv";
import { z } from "zod";
import { ValidationError } from "../lib/errors.js";

dotenv.config();

const envBoolean = z.preprocess((value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes", "y", "on"].includes(normalized)) {
    return true;
  }
  if (["false", "0", "no", "n", "off"].includes(normalized)) {
    return false;
  }

  return value;
}, z.boolean());

const envSchema = z.object({
  RENDER_API_KEY: z.string().min(1),
  RENDER_API_BASE_URL: z.string().url().default("https://api.render.com/v1"),
  MCP_SERVER_NAME: z.string().default("render-mcp"),
  MCP_SERVER_VERSION: z.string().default("1.0.0"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  READ_ONLY_MODE: envBoolean.default(false),
  REQUIRE_APPROVAL_FOR_DESTRUCTIVE: envBoolean.default(true),
  ALLOW_SECRET_VALUE_READ: envBoolean.default(false),
  PROD_ENV_NAMES: z.string().default("production,prod"),
  PROD_SERVICE_ALLOWLIST: z.string().default(""),
  REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
  RETRY_ATTEMPTS: z.coerce.number().int().min(0).max(10).default(3),
  RETRY_BASE_DELAY_MS: z.coerce.number().int().min(100).max(5000).default(300),
  AUDIT_LOG_PATH: z.string().default("./logs/audit.log"),
  APPROVAL_TOKEN: z.string().default("approved")
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new ValidationError("Environment validation failed", {
      meta: {
        issues: parsed.error.issues
      }
    });
  }
  return parsed.data;
}
