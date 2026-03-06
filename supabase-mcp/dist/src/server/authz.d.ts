import { type AccessLevel } from "../schemas/permissions.js";
import type { RequestContext } from "./context.js";
export interface AuthorizationMeta {
    access_level: AccessLevel;
    dangerous: boolean;
    confirmation_required: boolean;
    audit_log: boolean;
    group: "db" | "vector" | "storage" | "admin";
}
export declare function authorizeTool(context: RequestContext, toolName: string, input: Record<string, unknown>, meta: AuthorizationMeta): void;
