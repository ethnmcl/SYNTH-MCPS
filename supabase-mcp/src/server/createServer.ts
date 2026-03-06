import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TOOL_DEFINITIONS, type ToolDefinition } from "../schemas/toolSchemas.js";
import { authorizeTool } from "./authz.js";
import { writeAudit } from "./audit.js";
import { logger } from "../utils/logger.js";
import { createBaseContext, type RequestContext } from "./context.js";
import { summarizeRuntimeOverride, type CreateServerConfig, type RuntimeConfigOverride } from "./runtimeConfig.js";
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
} as Record<string, (ctx: RequestContext, input: Record<string, unknown>) => Promise<Record<string, unknown>>>;

function toTopLevelGroup(tool: ToolDefinition): "db" | "vector" | "storage" | "admin" {
  if (tool.group === "database_schema" || tool.group === "database_data") return "db";
  if (tool.group === "vector_search") return "vector";
  if (tool.group === "storage" || tool.group === "edge_functions") return "storage";
  return "admin";
}

function makeToolResult(output: Record<string, unknown>) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(output, null, 2) }],
    structuredContent: output,
  };
}

function mergeRuntimeConfig(
  base?: RuntimeConfigOverride,
  override?: RuntimeConfigOverride,
): RuntimeConfigOverride | undefined {
  if (!base && !override) return undefined;
  return {
    ...(base ?? {}),
    ...(override ?? {}),
  };
}

export function createServer(config?: CreateServerConfig) {
  const server = new McpServer({
    name: "supabase-mcp",
    version: "1.0.0",
    description:
      "MCP server for controlled Supabase access across database, storage, vectors, auth, edge functions, and project metadata.",
  });

  for (const tool of TOOL_DEFINITIONS) {
    const handler = handlers[tool.name];
    if (!handler) continue;

    const objectSchema = tool.inputSchema as z.AnyZodObject;
    server.tool(
      tool.name,
      `${tool.description}\n\naccess_level=${tool.access_level}; dangerous=${tool.dangerous}; confirmation_required=${tool.confirmation_required}; audit_log=${tool.audit_log}`,
      objectSchema.shape,
      async (rawInput: unknown, extra: unknown) => {
        const baseRuntime = config?.runtimeConfig;
        const resolvedRuntime = config?.resolveRuntimeConfig
          ? await config.resolveRuntimeConfig({
              toolName: tool.name,
              input: (rawInput ?? {}) as Record<string, unknown>,
              extra,
            })
          : undefined;
        const runtimeOverride = mergeRuntimeConfig(baseRuntime, resolvedRuntime);
        const context = createBaseContext(runtimeOverride);
        logger.debug("tool_runtime_config", {
          tool: tool.name,
          runtime: summarizeRuntimeOverride(runtimeOverride),
        });
        const input = tool.inputSchema.parse(rawInput ?? {}) as Record<string, unknown>;
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
        } catch (error) {
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
      },
    );
  }

  const resourceApi = server as unknown as {
    resource?: (name: string, uri: string, handler: () => Promise<{ text: string }>) => void;
  };

  if (resourceApi.resource) {
    resourceApi.resource("project_url", "supabase://project/url", async () => {
      const context = createBaseContext(config?.runtimeConfig);
      return { text: context.env.supabaseUrl };
    });

    resourceApi.resource("project_status", "supabase://project/status", async () => {
      const context = createBaseContext(config?.runtimeConfig);
      return {
        text: JSON.stringify(
          {
            project_ref: context.env.supabaseProjectRef,
            access_level: context.env.mcpAccessLevel,
            dangerous_tools_enabled: context.env.mcpEnableDangerousTools,
          },
          null,
          2,
        ),
      };
    });
  }

  return server;
}
