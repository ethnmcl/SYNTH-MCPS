import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { GitHubContext } from '../types/github.js';
import { normalizeError } from '../utils/errors.js';
import { repoTools } from '../tools/repos/index.js';
import { searchTools } from '../tools/search/index.js';
import { issueTools } from '../tools/issues/index.js';
import { pullTools } from '../tools/pulls/index.js';
import { fileTools } from '../tools/files/index.js';
import { actionTools } from '../tools/actions/index.js';
import { releaseTools } from '../tools/releases/index.js';
import { orgTools } from '../tools/orgs/index.js';
import { discussionTools } from '../tools/discussions/index.js';
import { projectTools } from '../tools/projects/index.js';
import { diagnosticTools } from '../tools/diagnostics/index.js';

export const registerTools = (server: McpServer, ctx: GitHubContext): void => {
  const tools = [
    ...repoTools,
    ...searchTools,
    ...issueTools,
    ...pullTools,
    ...fileTools,
    ...actionTools,
    ...releaseTools,
    ...orgTools,
    ...discussionTools,
    ...projectTools,
    ...diagnosticTools
  ];

  for (const tool of tools) {
    (server as any).tool(tool.name, tool.description, tool.inputSchema.shape ?? tool.inputSchema, async (input: unknown) => {
      try {
        const parsed = tool.inputSchema.parse(input ?? {});
        const out = await tool.execute(ctx, parsed as never);
        const pretty = JSON.stringify(out.data, null, 2);
        const text = pretty.length > 40_000 ? `${out.summary}\n\n${pretty.slice(0, 40_000)}\n...truncated` : `${out.summary}\n\n${pretty}`;
        return {
          content: [{ type: 'text', text }],
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
    });
  }
};
