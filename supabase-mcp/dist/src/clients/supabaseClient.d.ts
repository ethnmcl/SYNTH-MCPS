import { type SupabaseClient } from "@supabase/supabase-js";
import type { AppEnv } from "../config/env.js";
export interface SupabaseClients {
    anonClient?: SupabaseClient;
    serviceRoleClient?: SupabaseClient;
}
export declare function buildSupabaseClients(env: AppEnv): SupabaseClients;
export declare function requireServiceRole(clients: SupabaseClients): SupabaseClient;
