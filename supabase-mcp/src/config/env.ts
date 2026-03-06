import dotenv from "dotenv";
import { z } from "zod";
import { AccessLevelSchema, ToolGroupSchema, type AccessLevel, type ToolGroup } from "../schemas/permissions.js";
import { deriveSupabaseUrls } from "./urls.js";

dotenv.config();

const EmptyToUndefinedStringSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().optional(),
);

const OptionalUrlSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().url().optional(),
);

const BoolStringSchema = z
  .string()
  .optional()
  .transform((value) => value?.toLowerCase() === "true");

const EnvSchema = z.object({
  SUPABASE_ACCESS_TOKEN: EmptyToUndefinedStringSchema,
  SUPABASE_PROJECT_REF: EmptyToUndefinedStringSchema,
  SUPABASE_DB_PASSWORD: EmptyToUndefinedStringSchema,
  SUPABASE_ANON_KEY: EmptyToUndefinedStringSchema,
  SUPABASE_SERVICE_ROLE_KEY: EmptyToUndefinedStringSchema,
  SUPABASE_URL: OptionalUrlSchema,
  SUPABASE_REST_URL: OptionalUrlSchema,
  SUPABASE_AUTH_URL: OptionalUrlSchema,
  SUPABASE_STORAGE_URL: OptionalUrlSchema,
  SUPABASE_FUNCTIONS_URL: OptionalUrlSchema,
  SUPABASE_MANAGEMENT_API_URL: OptionalUrlSchema,
  MCP_ACCESS_LEVEL: AccessLevelSchema.default("read_only"),
  MCP_ENABLE_DANGEROUS_TOOLS: BoolStringSchema,
  MCP_AUDIT_LOG_PATH: z.string().default("./logs/audit.log"),
  MCP_ACTOR: z.string().default("local-operator"),
  MCP_ENABLE_DRY_RUN: BoolStringSchema,
  MCP_TOOL_GROUPS: z.string().default("db,vector,storage,admin"),
  SUPABASE_FUNCTION_DEPLOY_HOOK: OptionalUrlSchema,
});

export interface AppEnv {
  supabaseAccessToken?: string;
  supabaseProjectRef: string;
  supabaseDbPassword?: string;
  supabaseAnonKey?: string;
  supabaseServiceRoleKey?: string;
  supabaseUrl: string;
  supabaseRestUrl: string;
  supabaseAuthUrl: string;
  supabaseStorageUrl: string;
  supabaseFunctionsUrl: string;
  supabaseManagementApiUrl: string;
  mcpAccessLevel: AccessLevel;
  mcpEnableDangerousTools: boolean;
  mcpAuditLogPath: string;
  mcpActor: string;
  mcpEnableDryRun: boolean;
  mcpToolGroups: Set<ToolGroup>;
  supabaseFunctionDeployHook?: string;
}

interface GetEnvOptions {
  allowPartial?: boolean;
  overrides?: Partial<Record<string, string | undefined>>;
}

export function getEnv(options: GetEnvOptions = {}): AppEnv {
  const mergedSource = {
    ...process.env,
    ...(options.overrides ?? {}),
  };
  const parsed = EnvSchema.parse(mergedSource);
  const allowPartial = options.allowPartial ?? false;

  if (!parsed.SUPABASE_PROJECT_REF && !allowPartial) {
    throw new Error(
      "SUPABASE_PROJECT_REF is required. Set it directly or run `npm run discover:supabase` after exporting SUPABASE_ACCESS_TOKEN.",
    );
  }

  const urls = parsed.SUPABASE_PROJECT_REF
    ? deriveSupabaseUrls(parsed.SUPABASE_PROJECT_REF, {
        supabaseUrl: parsed.SUPABASE_URL,
        restUrl: parsed.SUPABASE_REST_URL,
        authUrl: parsed.SUPABASE_AUTH_URL,
        storageUrl: parsed.SUPABASE_STORAGE_URL,
        functionsUrl: parsed.SUPABASE_FUNCTIONS_URL,
        managementApiUrl: parsed.SUPABASE_MANAGEMENT_API_URL,
      })
    : {
        supabaseUrl: parsed.SUPABASE_URL ?? "[MISSING]",
        restUrl:
          parsed.SUPABASE_REST_URL ??
          (parsed.SUPABASE_URL ? `${parsed.SUPABASE_URL}/rest/v1` : "[MISSING]"),
        authUrl:
          parsed.SUPABASE_AUTH_URL ??
          (parsed.SUPABASE_URL ? `${parsed.SUPABASE_URL}/auth/v1` : "[MISSING]"),
        storageUrl:
          parsed.SUPABASE_STORAGE_URL ??
          (parsed.SUPABASE_URL ? `${parsed.SUPABASE_URL}/storage/v1` : "[MISSING]"),
        functionsUrl:
          parsed.SUPABASE_FUNCTIONS_URL ??
          (parsed.SUPABASE_URL ? `${parsed.SUPABASE_URL}/functions/v1` : "[MISSING]"),
        managementApiUrl: parsed.SUPABASE_MANAGEMENT_API_URL ?? "https://api.supabase.com/v1",
      };

  const groups = new Set<ToolGroup>();
  for (const raw of parsed.MCP_TOOL_GROUPS.split(",").map((v) => v.trim()).filter(Boolean)) {
    const result = ToolGroupSchema.safeParse(raw);
    if (result.success) groups.add(result.data);
  }
  if (groups.size === 0) {
    groups.add("db");
    groups.add("vector");
    groups.add("storage");
    groups.add("admin");
  }

  return {
    supabaseAccessToken: parsed.SUPABASE_ACCESS_TOKEN,
    supabaseProjectRef: parsed.SUPABASE_PROJECT_REF ?? "[MISSING]",
    supabaseDbPassword: parsed.SUPABASE_DB_PASSWORD,
    supabaseAnonKey: parsed.SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: parsed.SUPABASE_SERVICE_ROLE_KEY,
    supabaseUrl: urls.supabaseUrl,
    supabaseRestUrl: urls.restUrl,
    supabaseAuthUrl: urls.authUrl,
    supabaseStorageUrl: urls.storageUrl,
    supabaseFunctionsUrl: urls.functionsUrl,
    supabaseManagementApiUrl: urls.managementApiUrl,
    mcpAccessLevel: parsed.MCP_ACCESS_LEVEL,
    mcpEnableDangerousTools: parsed.MCP_ENABLE_DANGEROUS_TOOLS ?? false,
    mcpAuditLogPath: parsed.MCP_AUDIT_LOG_PATH,
    mcpActor: parsed.MCP_ACTOR,
    mcpEnableDryRun: parsed.MCP_ENABLE_DRY_RUN ?? false,
    mcpToolGroups: groups,
    supabaseFunctionDeployHook: parsed.SUPABASE_FUNCTION_DEPLOY_HOOK,
  };
}

export function requiredSecretPresence(env: AppEnv): Record<string, boolean> {
  return {
    SUPABASE_ACCESS_TOKEN: Boolean(env.supabaseAccessToken),
    SUPABASE_ANON_KEY: Boolean(env.supabaseAnonKey),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(env.supabaseServiceRoleKey),
    SUPABASE_DB_PASSWORD: Boolean(env.supabaseDbPassword),
  };
}
