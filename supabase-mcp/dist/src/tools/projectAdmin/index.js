import { resolveApiKeys } from "../../server/apiKeys.js";
import { redactKey } from "../../utils/redact.js";
export const projectAdminTools = {
    async get_project_info(context) {
        const info = await context.managementApi.getProjectInfo();
        return {
            project_ref: String(info.ref ?? context.env.supabaseProjectRef),
            name: typeof info.name === "string" ? info.name : undefined,
            region: typeof info.region === "string" ? info.region : undefined,
        };
    },
    async get_project_url(context) {
        return { url: context.env.supabaseUrl };
    },
    async get_api_keys(context, input) {
        const reveal = Boolean(input.reveal ?? false);
        const keys = await resolveApiKeys(context);
        const anon = keys.anonKey;
        const service = keys.serviceRoleKey;
        if (!reveal) {
            return {
                anon_key: redactKey(anon),
                service_role_key: redactKey(service),
            };
        }
        return {
            anon_key: anon,
            service_role_key: service,
        };
    },
    async get_logs(context, input) {
        const logType = String(input.log_type);
        const limit = Number(input.limit ?? 100);
        const logs = await context.managementApi.getLogs(logType, limit);
        return { logs };
    },
};
