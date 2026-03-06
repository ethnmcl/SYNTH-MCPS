import { AuthzError } from "./errors.js";
import { TOOL_ACCESS, DANGEROUS_TOOLS, TOOL_GROUP_MEMBERSHIP, canAccess, type AccessLevel } from "../schemas/permissions.js";
import type { RequestContext } from "./context.js";

export interface AuthorizationMeta {
  access_level: AccessLevel;
  dangerous: boolean;
  confirmation_required: boolean;
  audit_log: boolean;
  group: "db" | "vector" | "storage" | "admin";
}

export function authorizeTool(
  context: RequestContext,
  toolName: string,
  input: Record<string, unknown>,
  meta: AuthorizationMeta,
): void {
  if (!context.env.mcpToolGroups.has(meta.group)) {
    throw new AuthzError(`Tool group '${meta.group}' is disabled by MCP_TOOL_GROUPS.`);
  }

  const required = TOOL_ACCESS[toolName] ?? meta.access_level;
  if (!canAccess(context.env.mcpAccessLevel, required)) {
    throw new AuthzError(`Tool '${toolName}' requires '${required}' access.`);
  }

  if (meta.dangerous || DANGEROUS_TOOLS.has(toolName)) {
    if (!context.env.mcpEnableDangerousTools) {
      throw new AuthzError(`Dangerous tool '${toolName}' is disabled. Set MCP_ENABLE_DANGEROUS_TOOLS=true.`);
    }

    const confirmed = input.confirm === true;
    if (meta.confirmation_required && !confirmed) {
      throw new AuthzError(`Tool '${toolName}' requires explicit confirm=true.`);
    }
  }
}
