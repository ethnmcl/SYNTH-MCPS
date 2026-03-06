import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AppEnv } from "../config/env.js";
import { AppError } from "../server/errors.js";

export interface SupabaseClients {
  anonClient?: SupabaseClient;
  serviceRoleClient?: SupabaseClient;
}

export function buildSupabaseClients(env: AppEnv): SupabaseClients {
  const anonClient = env.supabaseAnonKey
    ? createClient(env.supabaseUrl, env.supabaseAnonKey, { auth: { persistSession: false } })
    : undefined;

  const serviceRoleClient = env.supabaseServiceRoleKey
    ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey, { auth: { persistSession: false } })
    : undefined;

  return { anonClient, serviceRoleClient };
}

export function requireServiceRole(clients: SupabaseClients): SupabaseClient {
  if (!clients.serviceRoleClient) {
    throw new AppError("MISSING_SERVICE_ROLE", "SUPABASE_SERVICE_ROLE_KEY is required for this tool.", 400);
  }
  return clients.serviceRoleClient;
}
