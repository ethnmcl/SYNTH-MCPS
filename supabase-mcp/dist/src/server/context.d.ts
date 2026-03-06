import { type AppEnv } from "../config/env.js";
import { type SupabaseClients } from "../clients/supabaseClient.js";
import { type ManagementApiClient } from "../clients/managementApiClient.js";
export interface RequestContext {
    requestId: string;
    actor: string;
    env: AppEnv;
    supabase: SupabaseClients;
    managementApi: ManagementApiClient;
}
export declare function createBaseContext(): RequestContext;
