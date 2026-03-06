import { createClient } from "@supabase/supabase-js";
import { AppError } from "../server/errors.js";
export function buildSupabaseClients(env) {
    const anonClient = env.supabaseAnonKey
        ? createClient(env.supabaseUrl, env.supabaseAnonKey, { auth: { persistSession: false } })
        : undefined;
    const serviceRoleClient = env.supabaseServiceRoleKey
        ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey, { auth: { persistSession: false } })
        : undefined;
    return { anonClient, serviceRoleClient };
}
export function requireServiceRole(clients) {
    if (!clients.serviceRoleClient) {
        throw new AppError("MISSING_SERVICE_ROLE", "SUPABASE_SERVICE_ROLE_KEY is required for this tool.", 400);
    }
    return clients.serviceRoleClient;
}
