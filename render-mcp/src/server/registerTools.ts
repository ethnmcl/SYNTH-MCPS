import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { normalizeUnknownError } from "../lib/errors.js";
import { formatToolResponse } from "../mcp/formatters/responseFormatter.js";
import { allTools } from "../mcp/tools/index.js";
import type { AppContext, ToolDefinition } from "../mcp/types.js";

function toToolError(error: unknown) {
  const normalized = normalizeUnknownError(error);
  return {
    ok: false,
    summary: normalized.message,
    details: {
      code: normalized.code,
      ...normalized.details
    },
    warnings: [],
    next_steps: []
  };
}

async function maybeAudit(
  context: AppContext,
  tool: ToolDefinition,
  args: Record<string, unknown>,
  result: unknown
) {
  if (!tool.mutating) {
    return;
  }
  await context.auditLogger.write({
    actor: "mcp_client",
    tool: tool.name,
    action: tool.name,
    timestamp: new Date().toISOString(),
    arguments: args,
    result: result as Record<string, unknown>,
    status: "success"
  });
}

export function registerTools(server: McpServer, context: AppContext): void {
  for (const tool of allTools) {
    server.registerTool(
      tool.name,
      {
        description: `${tool.description}${tool.mutating ? " [MUTATING]" : ""}${tool.destructive ? " [DESTRUCTIVE]" : ""}`,
        inputSchema: tool.inputSchema
      },
      async (args: unknown, _extra: unknown) => {
        try {
          const parsed = tool.inputSchema.parse(args ?? {}) as Record<string, unknown>;

          if (tool.mutating) {
            context.policyEngine.check({
              toolName: tool.name,
              mutating: true,
              destructive: Boolean(tool.destructive),
              environmentName:
                typeof parsed.environmentName === "string" ? parsed.environmentName : undefined,
              serviceNameOrId:
                typeof parsed.serviceNameOrId === "string"
                  ? parsed.serviceNameOrId
                  : typeof parsed.serviceId === "string"
                    ? parsed.serviceId
                    : undefined,
              approvalToken: typeof parsed.approvalToken === "string" ? parsed.approvalToken : undefined
            });
          }

          const result = await tool.handler(context, parsed as never);
          await maybeAudit(context, tool, parsed, result);
          return formatToolResponse(result as never);
        } catch (error) {
          const normalized = toToolError(error);
          context.logger.error({ event: "tool_failed", tool: tool.name, error: normalized.details });
          if (tool.mutating) {
            await context.auditLogger.write({
              actor: "mcp_client",
              tool: tool.name,
              action: tool.name,
              timestamp: new Date().toISOString(),
              arguments: (args ?? {}) as Record<string, unknown>,
              result: normalized.details,
              status: "failure"
            });
          }
          return {
            ...formatToolResponse(normalized),
            isError: true
          };
        }
      }
    );
  }
}
