import { z } from "zod";
import type { AccessLevel } from "./permissions.js";
export type ToolGroupName = "database_schema" | "database_data" | "vector_search" | "storage" | "auth" | "edge_functions" | "project_admin";
export interface ToolDefinition {
    name: string;
    description: string;
    group: ToolGroupName;
    access_level: AccessLevel;
    dangerous: boolean;
    confirmation_required: boolean;
    audit_log: boolean;
    inputSchema: z.ZodTypeAny;
    outputSchema: z.ZodTypeAny;
}
export declare const TOOL_DEFINITIONS: ToolDefinition[];
export declare const TOOL_BY_NAME: Map<string, ToolDefinition>;
