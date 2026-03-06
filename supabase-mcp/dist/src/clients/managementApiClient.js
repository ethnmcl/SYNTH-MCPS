import { ExternalApiError, NotImplementedFeatureError } from "../server/errors.js";
import { fetchJson } from "../utils/http.js";
function authHeaders(env) {
    if (!env.supabaseAccessToken) {
        throw new ExternalApiError("SUPABASE_ACCESS_TOKEN is required for Management API operations.");
    }
    return {
        Authorization: `Bearer ${env.supabaseAccessToken}`,
    };
}
export function buildManagementApiClient(env) {
    const base = env.supabaseManagementApiUrl;
    const projectRef = env.supabaseProjectRef;
    return {
        async getProjectInfo() {
            return fetchJson(`${base}/projects/${projectRef}`, {
                headers: authHeaders(env),
            });
        },
        async getApiKeys() {
            return fetchJson(`${base}/projects/${projectRef}/api-keys`, {
                headers: authHeaders(env),
            });
        },
        async listFunctions() {
            const result = await fetchJson(`${base}/projects/${projectRef}/functions`, { headers: authHeaders(env) });
            return result;
        },
        async deleteFunction(name) {
            await fetchJson(`${base}/projects/${projectRef}/functions/${name}`, {
                method: "DELETE",
                headers: authHeaders(env),
            });
        },
        async deployFunction(name, sourceCode, verifyJwt) {
            if (!env.supabaseFunctionDeployHook) {
                throw new NotImplementedFeatureError("Direct Edge Function deploy via Management API is adapter-based in this server. Set SUPABASE_FUNCTION_DEPLOY_HOOK.", { expected_env: "SUPABASE_FUNCTION_DEPLOY_HOOK" });
            }
            return fetchJson(`${env.supabaseFunctionDeployHook}/${projectRef}/${name}`, {
                method: "POST",
                headers: authHeaders(env),
                body: {
                    verify_jwt: verifyJwt,
                    source_code: sourceCode,
                },
            });
        },
        async executeSql(sql) {
            const result = await fetchJson(`${base}/projects/${projectRef}/database/query`, {
                method: "POST",
                headers: authHeaders(env),
                body: { query: sql },
            });
            return result.result ?? [];
        },
        async getLogs(logType, limit) {
            try {
                const response = await fetchJson(`${base}/projects/${projectRef}/logs?service=${encodeURIComponent(logType)}&limit=${limit}`, { headers: authHeaders(env) });
                return response.logs ?? [];
            }
            catch (error) {
                throw new NotImplementedFeatureError("This log type endpoint is not available in this environment yet. See TODO in project_admin tools.", {
                    log_type: logType,
                    cause: error instanceof Error ? error.message : "unknown",
                });
            }
        },
    };
}
