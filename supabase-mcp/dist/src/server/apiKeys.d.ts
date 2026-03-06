import { type SupabaseClient } from "@supabase/supabase-js";
import type { RequestContext } from "./context.js";
export interface ResolvedApiKeys {
    anonKey?: string;
    serviceRoleKey?: string;
}
export declare function extractApiKeys(payload: unknown): ResolvedApiKeys;
export declare function requireServiceRoleClient(context: RequestContext): Promise<SupabaseClient>;
export declare function resolveApiKeys(context: RequestContext): Promise<ResolvedApiKeys>;
