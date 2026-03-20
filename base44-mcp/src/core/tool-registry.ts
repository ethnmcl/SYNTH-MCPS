import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppContext, ToolDefinition } from './types.js';
import { normalizeError } from './errors.js';
import { allTools } from '../tools/index.js';

export const registerTools = (server: McpServer, ctx: AppContext): void => {
  for (const tool of allTools) {
    (server as any).tool(
      tool.name,
      tool.description,
      tool.inputSchema.shape ?? tool.inputSchema,
      async (input: unknown) => {
        try {
          const parsed = tool.inputSchema.parse(input ?? {});
          const out = await tool.execute(ctx, parsed as never);
          return {
            content: [{ type: 'text', text: `${out.summary}\n\n${JSON.stringify(out.data, null, 2)}` }],
            structuredContent: out.data
          };
        } catch (error) {
          const normalized = normalizeError(error);
          return {
            content: [{ type: 'text', text: `Error: ${normalized.message}` }],
            structuredContent: {
              error: {
                message: normalized.message,
                statusCode: normalized.statusCode,
                details: normalized.details
              }
            },
            isError: true
          };
        }
      }
    );
  }
};

export const getToolDefinitions = (): ToolDefinition<any>[] => allTools;
