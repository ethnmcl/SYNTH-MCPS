import type { IncomingHttpHeaders } from "node:http";
import { z } from "zod";
import type { AccessLevel } from "../schemas/permissions.js";
import { AccessLevelSchema } from "../schemas/permissions.js";
import { redactKey } from "../utils/redact.js";

export interface RuntimeConfigOverride {
  supabaseAccessToken?: string;
  supabaseProjectRef?: string;
  supabaseServiceRoleKey?: string;
  supabaseAnonKey?: string;
  mcpAccessLevel?: AccessLevel;
  mcpEnableDangerousTools?: boolean;
  actor?: string;
}

export interface CreateServerConfig {
  runtimeConfig?: RuntimeConfigOverride;
  resolveRuntimeConfig?: (params: {
    toolName: string;
    input: Record<string, unknown>;
    extra?: unknown;
  }) => RuntimeConfigOverride | Promise<RuntimeConfigOverride>;
}

const HeaderConfigSchema = z.object({
  accessToken: z.string().min(1).optional(),
  projectRef: z.string().min(1).optional(),
  serviceRoleKey: z.string().min(1).optional(),
  anonKey: z.string().min(1).optional(),
  accessLevel: AccessLevelSchema.optional(),
  dangerous: z.boolean().optional(),
  actor: z.string().min(1).optional(),
});

function readHeader(headers: IncomingHttpHeaders, key: string): string | undefined {
  const value = headers[key.toLowerCase()];
  if (Array.isArray(value)) return value[0];
  if (typeof value === "string" && value.trim()) return value;
  return undefined;
}

function parseBoolean(value?: string): boolean | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return undefined;
}

export function runtimeConfigFromHeaders(headers: IncomingHttpHeaders): RuntimeConfigOverride {
  const bearer = readHeader(headers, "authorization");
  const tokenFromBearer = bearer?.toLowerCase().startsWith("bearer ") ? bearer.slice(7).trim() : undefined;

  const parsed = HeaderConfigSchema.parse({
    accessToken: readHeader(headers, "x-supabase-access-token") ?? tokenFromBearer,
    projectRef: readHeader(headers, "x-supabase-project-ref"),
    serviceRoleKey: readHeader(headers, "x-supabase-service-role-key"),
    anonKey: readHeader(headers, "x-supabase-anon-key"),
    accessLevel: readHeader(headers, "x-mcp-access-level"),
    dangerous: parseBoolean(readHeader(headers, "x-mcp-enable-dangerous-tools")),
    actor: readHeader(headers, "x-mcp-actor"),
  });

  return {
    supabaseAccessToken: parsed.accessToken,
    supabaseProjectRef: parsed.projectRef,
    supabaseServiceRoleKey: parsed.serviceRoleKey,
    supabaseAnonKey: parsed.anonKey,
    mcpAccessLevel: parsed.accessLevel,
    mcpEnableDangerousTools: parsed.dangerous,
    actor: parsed.actor,
  };
}

export function summarizeRuntimeOverride(override?: RuntimeConfigOverride): Record<string, unknown> {
  if (!override) return { override: false };
  return {
    override: true,
    access_token: override.supabaseAccessToken ? redactKey(override.supabaseAccessToken) : "[UNSET]",
    service_role_key: override.supabaseServiceRoleKey ? redactKey(override.supabaseServiceRoleKey) : "[UNSET]",
    anon_key: override.supabaseAnonKey ? redactKey(override.supabaseAnonKey) : "[UNSET]",
    project_ref: override.supabaseProjectRef ?? "[UNSET]",
    access_level: override.mcpAccessLevel ?? "[UNSET]",
    dangerous_tools: override.mcpEnableDangerousTools ?? "[UNSET]",
    actor: override.actor ?? "[UNSET]",
  };
}
