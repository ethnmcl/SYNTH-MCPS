import { type AccessLevel, type ToolGroup } from "../schemas/permissions.js";
export interface AppEnv {
    supabaseAccessToken?: string;
    supabaseProjectRef: string;
    supabaseDbPassword?: string;
    supabaseAnonKey?: string;
    supabaseServiceRoleKey?: string;
    supabaseUrl: string;
    supabaseRestUrl: string;
    supabaseAuthUrl: string;
    supabaseStorageUrl: string;
    supabaseFunctionsUrl: string;
    supabaseManagementApiUrl: string;
    mcpAccessLevel: AccessLevel;
    mcpEnableDangerousTools: boolean;
    mcpAuditLogPath: string;
    mcpActor: string;
    mcpEnableDryRun: boolean;
    mcpToolGroups: Set<ToolGroup>;
    supabaseFunctionDeployHook?: string;
}
interface GetEnvOptions {
    allowPartial?: boolean;
}
export declare function getEnv(options?: GetEnvOptions): AppEnv;
export declare function requiredSecretPresence(env: AppEnv): Record<string, boolean>;
export {};
