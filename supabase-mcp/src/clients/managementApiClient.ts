import type { AppEnv } from "../config/env.js";
import { ExternalApiError, NotImplementedFeatureError } from "../server/errors.js";
import { fetchJson } from "../utils/http.js";

export interface ManagementApiClient {
  listProjects(): Promise<Array<Record<string, unknown>>>;
  createProject(input: {
    name: string;
    organization_id: string;
    region: string;
    plan?: string;
    db_pass?: string;
    kps_enabled?: boolean;
  }): Promise<Record<string, unknown>>;
  pauseProject(projectRef?: string): Promise<Record<string, unknown>>;
  resumeProject(projectRef?: string): Promise<Record<string, unknown>>;
  deleteProject(projectRef?: string): Promise<void>;
  getProjectInfo(): Promise<Record<string, unknown>>;
  getApiKeys(): Promise<Record<string, unknown>>;
  listFunctions(): Promise<Array<Record<string, unknown>>>;
  deleteFunction(name: string): Promise<void>;
  deployFunction(name: string, sourceCode: string, verifyJwt: boolean): Promise<Record<string, unknown>>;
  executeSql(sql: string): Promise<Array<Record<string, unknown>>>;
  getLogs(logType: "database" | "auth" | "functions" | "storage", limit: number): Promise<Array<Record<string, unknown>>>;
}

function authHeaders(env: AppEnv): Record<string, string> {
  if (!env.supabaseAccessToken) {
    throw new ExternalApiError("SUPABASE_ACCESS_TOKEN is required for Management API operations.");
  }

  return {
    Authorization: `Bearer ${env.supabaseAccessToken}`,
  };
}

export function buildManagementApiClient(env: AppEnv): ManagementApiClient {
  const base = env.supabaseManagementApiUrl;
  const projectRef = env.supabaseProjectRef;

  return {
    async listProjects(): Promise<Array<Record<string, unknown>>> {
      const result = await fetchJson<Array<Record<string, unknown>>>(`${base}/projects`, {
        headers: authHeaders(env),
      });
      return result;
    },

    async createProject(input): Promise<Record<string, unknown>> {
      return fetchJson<Record<string, unknown>>(`${base}/projects`, {
        method: "POST",
        headers: authHeaders(env),
        body: input,
      });
    },

    async pauseProject(projectRefArg?: string): Promise<Record<string, unknown>> {
      const ref = projectRefArg ?? projectRef;
      return fetchJson<Record<string, unknown>>(`${base}/projects/${ref}/pause`, {
        method: "POST",
        headers: authHeaders(env),
      });
    },

    async resumeProject(projectRefArg?: string): Promise<Record<string, unknown>> {
      const ref = projectRefArg ?? projectRef;
      return fetchJson<Record<string, unknown>>(`${base}/projects/${ref}/resume`, {
        method: "POST",
        headers: authHeaders(env),
      });
    },

    async deleteProject(projectRefArg?: string): Promise<void> {
      const ref = projectRefArg ?? projectRef;
      await fetchJson<Record<string, unknown>>(`${base}/projects/${ref}`, {
        method: "DELETE",
        headers: authHeaders(env),
      });
    },

    async getProjectInfo(): Promise<Record<string, unknown>> {
      return fetchJson<Record<string, unknown>>(`${base}/projects/${projectRef}`, {
        headers: authHeaders(env),
      });
    },

    async getApiKeys(): Promise<Record<string, unknown>> {
      return fetchJson<Record<string, unknown>>(`${base}/projects/${projectRef}/api-keys`, {
        headers: authHeaders(env),
      });
    },

    async listFunctions(): Promise<Array<Record<string, unknown>>> {
      const result = await fetchJson<Array<Record<string, unknown>>>(
        `${base}/projects/${projectRef}/functions`,
        { headers: authHeaders(env) },
      );
      return result;
    },

    async deleteFunction(name: string): Promise<void> {
      await fetchJson<Record<string, unknown>>(`${base}/projects/${projectRef}/functions/${name}`, {
        method: "DELETE",
        headers: authHeaders(env),
      });
    },

    async deployFunction(name: string, sourceCode: string, verifyJwt: boolean): Promise<Record<string, unknown>> {
      if (!env.supabaseFunctionDeployHook) {
        throw new NotImplementedFeatureError(
          "Direct Edge Function deploy via Management API is adapter-based in this server. Set SUPABASE_FUNCTION_DEPLOY_HOOK.",
          { expected_env: "SUPABASE_FUNCTION_DEPLOY_HOOK" },
        );
      }

      return fetchJson<Record<string, unknown>>(
        `${env.supabaseFunctionDeployHook}/${projectRef}/${name}`,
        {
          method: "POST",
          headers: authHeaders(env),
          body: {
            verify_jwt: verifyJwt,
            source_code: sourceCode,
          },
        },
      );
    },

    async executeSql(sql: string): Promise<Array<Record<string, unknown>>> {
      const result = await fetchJson<{ result?: Array<Record<string, unknown>> }>(
        `${base}/projects/${projectRef}/database/query`,
        {
          method: "POST",
          headers: authHeaders(env),
          body: { query: sql },
        },
      );
      return result.result ?? [];
    },

    async getLogs(logType: "database" | "auth" | "functions" | "storage", limit: number): Promise<Array<Record<string, unknown>>> {
      try {
        const response = await fetchJson<{ logs?: Array<Record<string, unknown>> }>(
          `${base}/projects/${projectRef}/logs?service=${encodeURIComponent(logType)}&limit=${limit}`,
          { headers: authHeaders(env) },
        );
        return response.logs ?? [];
      } catch (error) {
        throw new NotImplementedFeatureError(
          "This log type endpoint is not available in this environment yet. See TODO in project_admin tools.",
          {
            log_type: logType,
            cause: error instanceof Error ? error.message : "unknown",
          },
        );
      }
    },
  };
}
