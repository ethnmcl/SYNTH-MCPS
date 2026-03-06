import type { AppEnv } from "../config/env.js";
export interface ManagementApiClient {
    getProjectInfo(): Promise<Record<string, unknown>>;
    getApiKeys(): Promise<Record<string, unknown>>;
    listFunctions(): Promise<Array<Record<string, unknown>>>;
    deleteFunction(name: string): Promise<void>;
    deployFunction(name: string, sourceCode: string, verifyJwt: boolean): Promise<Record<string, unknown>>;
    executeSql(sql: string): Promise<Array<Record<string, unknown>>>;
    getLogs(logType: "database" | "auth" | "functions" | "storage", limit: number): Promise<Array<Record<string, unknown>>>;
}
export declare function buildManagementApiClient(env: AppEnv): ManagementApiClient;
