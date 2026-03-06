import { AuthzError } from "./errors.js";
import { TOOL_ACCESS, DANGEROUS_TOOLS, canAccess } from "../schemas/permissions.js";
export function authorizeTool(context, toolName, input, meta) {
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
