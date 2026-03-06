import { randomUUID } from "node:crypto";
import { getEnv, type AppEnv } from "../config/env.js";
import { buildSupabaseClients, type SupabaseClients } from "../clients/supabaseClient.js";
import { buildManagementApiClient, type ManagementApiClient } from "../clients/managementApiClient.js";
import type { RuntimeConfigOverride } from "./runtimeConfig.js";

export interface RequestContext {
  requestId: string;
  actor: string;
  env: AppEnv;
  supabase: SupabaseClients;
  managementApi: ManagementApiClient;
}

function toEnvOverrides(runtime?: RuntimeConfigOverride): Partial<Record<string, string | undefined>> {
  if (!runtime) return {};
  return {
    SUPABASE_ACCESS_TOKEN: runtime.supabaseAccessToken,
    SUPABASE_PROJECT_REF: runtime.supabaseProjectRef,
    MCP_ACCESS_LEVEL: runtime.mcpAccessLevel,
    MCP_ENABLE_DANGEROUS_TOOLS:
      runtime.mcpEnableDangerousTools === undefined ? undefined : String(runtime.mcpEnableDangerousTools),
    MCP_ACTOR: runtime.actor,
  };
}

export function createBaseContext(runtime?: RuntimeConfigOverride): RequestContext {
  const env = getEnv({ overrides: toEnvOverrides(runtime) });
  return {
    requestId: randomUUID(),
    actor: env.mcpActor,
    env,
    supabase: buildSupabaseClients(env),
    managementApi: buildManagementApiClient(env),
  };
}
