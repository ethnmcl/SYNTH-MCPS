import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TOOL_DEFINITIONS } from "../schemas/toolSchemas.js";
import { authorizeTool } from "./authz.js";
import { writeAudit } from "./audit.js";
import { logger } from "../utils/logger.js";
import { createBaseContext } from "./context.js";
import { databaseSchemaTools } from "../tools/databaseSchema/index.js";
import { databaseDataTools } from "../tools/databaseData/index.js";
import { vectorSearchTools } from "../tools/vectorSearch/index.js";
import { storageTools } from "../tools/storage/index.js";
import { authTools } from "../tools/auth/index.js";
import { edgeFunctionsTools } from "../tools/edgeFunctions/index.js";
import { projectAdminTools } from "../tools/projectAdmin/index.js";
const handlers = {
    ...databaseSchemaTools,
    ...databaseDataTools,
    ...vectorSearchTools,
    ...storageTools,
    ...authTools,
    ...edgeFunctionsTools,
    ...projectAdminTools,
};
function toTopLevelGroup(tool) {
    if (tool.group === "database_schema" || tool.group === "database_data")
        return "db";
    if (tool.group === "vector_search")
        return "vector";
    if (tool.group === "storage" || tool.group === "edge_functions")
        return "storage";
    return "admin";
}
function makeToolResult(output) {
    return {
        content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
        structuredContent: output,
    };
}
export function createServer() {
    const server = new McpServer({
        name: "supabase-mcp",
        version: "1.0.0",
        description: "MCP server for controlled Supabase access across database, storage, vectors, auth, edge functions, and project metadata.",
    });
    for (const tool of TOOL_DEFINITIONS) {
        const handler = handlers[tool.name];
        if (!handler)
            continue;
        const objectSchema = tool.inputSchema;
        server.tool(tool.name, `${tool.description}\n\naccess_level=${tool.access_level}; dangerous=${tool.dangerous}; confirmation_required=${tool.confirmation_required}; audit_log=${tool.audit_log}`, objectSchema.shape, async (rawInput) => {
            const context = createBaseContext();
            const input = tool.inputSchema.parse(rawInput ?? {});
            const shouldAudit = tool.audit_log || tool.dangerous || tool.access_level === "admin";
            authorizeTool(context, tool.name, input, {
                access_level: tool.access_level,
                dangerous: tool.dangerous,
                confirmation_required: tool.confirmation_required,
                audit_log: tool.audit_log,
                group: toTopLevelGroup(tool),
            });
            if (context.env.mcpEnableDryRun && tool.dangerous) {
                const dryRun = {
                    success: true,
                    dry_run: true,
                    tool: tool.name,
                    message: "Dangerous tool was not executed because MCP_ENABLE_DRY_RUN=true.",
                };
                if (shouldAudit) {
                    await writeAudit(context, tool.name, input, "success");
                }
                return makeToolResult(dryRun);
            }
            try {
                const output = tool.outputSchema.parse(await handler(context, input));
                if (shouldAudit) {
                    await writeAudit(context, tool.name, input, "success");
                }
                return makeToolResult(output);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown tool error";
                logger.error("tool_execution_failed", {
                    request_id: context.requestId,
                    tool: tool.name,
                    actor: context.actor,
                    error: message,
                });
                if (shouldAudit) {
                    await writeAudit(context, tool.name, input, "failure", message);
                }
                throw error;
            }
        });
    }
    const resourceApi = server;
    if (resourceApi.resource) {
        resourceApi.resource("project_url", "supabase://project/url", async () => {
            const context = createBaseContext();
            return { text: context.env.supabaseUrl };
        });
        resourceApi.resource("project_status", "supabase://project/status", async () => {
            const context = createBaseContext();
            return {
                text: JSON.stringify({
                    project_ref: context.env.supabaseProjectRef,
                    access_level: context.env.mcpAccessLevel,
                    dangerous_tools_enabled: context.env.mcpEnableDangerousTools,
                }, null, 2),
            };
        });
    }
    return server;
}
