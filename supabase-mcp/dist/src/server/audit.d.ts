import type { RequestContext } from "./context.js";
export interface AuditRecord {
    timestamp: string;
    request_id: string;
    tool_name: string;
    actor: string;
    access_level: string;
    sanitized_input: unknown;
    status: "success" | "failure";
    error_message?: string;
}
export declare function writeAudit(context: RequestContext, toolName: string, input: unknown, status: "success" | "failure", errorMessage?: string): Promise<void>;
