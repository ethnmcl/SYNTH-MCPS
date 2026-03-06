import type { RequestContext } from "../../server/context.js";
import { resolveApiKeys } from "../../server/apiKeys.js";
import { redactKey } from "../../utils/redact.js";

type ToolHandler = (context: RequestContext, input: Record<string, unknown>) => Promise<Record<string, unknown>>;

export const projectAdminTools: Record<string, ToolHandler> = {
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
    const logType = String(input.log_type) as "database" | "auth" | "functions" | "storage";
    const limit = Number(input.limit ?? 100);
    const logs = await context.managementApi.getLogs(logType, limit);
    return { logs };
  },

  async list_projects(context) {
    const projects = await context.managementApi.listProjects();
    return { projects };
  },

  async create_project(context, input) {
    const created = await context.managementApi.createProject({
      name: String(input.name),
      organization_id: String(input.organization_id),
      region: String(input.region),
      plan: typeof input.plan === "string" ? input.plan : undefined,
      db_pass: typeof input.db_pass === "string" ? input.db_pass : undefined,
      kps_enabled: typeof input.kps_enabled === "boolean" ? input.kps_enabled : undefined,
    });

    return {
      success: true,
      project_ref: typeof created.ref === "string" ? created.ref : undefined,
      project_id: typeof created.id === "string" ? created.id : undefined,
      status: typeof created.status === "string" ? created.status : undefined,
    };
  },

  async pause_project(context, input) {
    const targetRef = typeof input.project_ref === "string" ? input.project_ref : context.env.supabaseProjectRef;
    const result = await context.managementApi.pauseProject(targetRef);
    return {
      success: true,
      project_ref: targetRef,
      status: typeof result.status === "string" ? result.status : undefined,
    };
  },

  async resume_project(context, input) {
    const targetRef = typeof input.project_ref === "string" ? input.project_ref : context.env.supabaseProjectRef;
    const result = await context.managementApi.resumeProject(targetRef);
    return {
      success: true,
      project_ref: targetRef,
      status: typeof result.status === "string" ? result.status : undefined,
    };
  },

  async delete_project(context, input) {
    const targetRef = typeof input.project_ref === "string" ? input.project_ref : context.env.supabaseProjectRef;
    await context.managementApi.deleteProject(targetRef);
    return { success: true, project_ref: targetRef };
  },
};
