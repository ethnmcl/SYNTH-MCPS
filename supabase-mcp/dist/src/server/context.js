import { randomUUID } from "node:crypto";
import { getEnv } from "../config/env.js";
import { buildSupabaseClients } from "../clients/supabaseClient.js";
import { buildManagementApiClient } from "../clients/managementApiClient.js";
export function createBaseContext() {
    const env = getEnv();
    return {
        requestId: randomUUID(),
        actor: env.mcpActor,
        env,
        supabase: buildSupabaseClients(env),
        managementApi: buildManagementApiClient(env),
    };
}
