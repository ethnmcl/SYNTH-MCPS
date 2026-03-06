import { createClient } from "@supabase/supabase-js";
import { AppError } from "./errors.js";
function pickKeyValue(record) {
    const candidates = [record.api_key, record.key, record.value, record.secret, record.token];
    for (const candidate of candidates) {
        if (typeof candidate === "string" && candidate.length > 0)
            return candidate;
    }
    return undefined;
}
export function extractApiKeys(payload) {
    const out = {};
    if (!payload || typeof payload !== "object") {
        return out;
    }
    const record = payload;
    if (typeof record.anon_key === "string")
        out.anonKey = record.anon_key;
    if (typeof record.service_role_key === "string")
        out.serviceRoleKey = record.service_role_key;
    const collections = [];
    if (Array.isArray(payload))
        collections.push(payload);
    if (Array.isArray(record.keys))
        collections.push(record.keys);
    if (Array.isArray(record.data))
        collections.push(record.data);
    for (const collection of collections) {
        for (const item of collection) {
            if (!item || typeof item !== "object")
                continue;
            const row = item;
            const name = [row.name, row.type, row.role, row.key_type]
                .filter((v) => typeof v === "string")
                .join(" ")
                .toLowerCase();
            const keyValue = pickKeyValue(row);
            if (!keyValue)
                continue;
            if (!out.anonKey && name.includes("anon")) {
                out.anonKey = keyValue;
            }
            if (!out.serviceRoleKey && (name.includes("service_role") || name.includes("service role"))) {
                out.serviceRoleKey = keyValue;
            }
        }
    }
    return out;
}
async function hydrateKeysFromManagement(context) {
    const payload = await context.managementApi.getApiKeys();
    const keys = extractApiKeys(payload);
    if (keys.anonKey) {
        context.env.supabaseAnonKey = keys.anonKey;
        if (!context.supabase.anonClient) {
            context.supabase.anonClient = createClient(context.env.supabaseUrl, keys.anonKey, {
                auth: { persistSession: false },
            });
        }
    }
    if (keys.serviceRoleKey) {
        context.env.supabaseServiceRoleKey = keys.serviceRoleKey;
        if (!context.supabase.serviceRoleClient) {
            context.supabase.serviceRoleClient = createClient(context.env.supabaseUrl, keys.serviceRoleKey, {
                auth: { persistSession: false },
            });
        }
    }
    return keys;
}
export async function requireServiceRoleClient(context) {
    if (context.supabase.serviceRoleClient) {
        return context.supabase.serviceRoleClient;
    }
    const keys = await hydrateKeysFromManagement(context);
    if (keys.serviceRoleKey && context.supabase.serviceRoleClient) {
        return context.supabase.serviceRoleClient;
    }
    throw new AppError("MISSING_SERVICE_ROLE", "Service-role key unavailable. Provide SUPABASE_SERVICE_ROLE_KEY or allow get_api_keys via Management API.", 400);
}
export async function resolveApiKeys(context) {
    if (context.env.supabaseAnonKey && context.env.supabaseServiceRoleKey) {
        return {
            anonKey: context.env.supabaseAnonKey,
            serviceRoleKey: context.env.supabaseServiceRoleKey,
        };
    }
    const fetched = await hydrateKeysFromManagement(context);
    return {
        anonKey: context.env.supabaseAnonKey ?? fetched.anonKey,
        serviceRoleKey: context.env.supabaseServiceRoleKey ?? fetched.serviceRoleKey,
    };
}
