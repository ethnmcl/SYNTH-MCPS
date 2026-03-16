import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadConfig } from "./config.js";
import { ObsidianMcpError } from "./errors.js";
import { logger } from "./logger.js";
import { registerResearchContextPrompt } from "./prompts/researchContextPrompt.js";
import { registerSummarizeVaultPrompt } from "./prompts/summarizeVaultPrompt.js";
import { registerVaultReadmeResource } from "./resources/vaultReadmeResource.js";
import { DailyNoteService } from "./services/dailyNoteService.js";
import { EmbeddingService } from "./services/embeddingService.js";
import { GraphService } from "./services/graphService.js";
import { IndexerService } from "./services/indexerService.js";
import { NoteService } from "./services/noteService.js";
import { SearchService } from "./services/searchService.js";
import { TaskService } from "./services/taskService.js";
import { TemplateService } from "./services/templateService.js";
import { VaultService } from "./services/vaultService.js";
import { TOOLS } from "./tools/index.js";
import type { ObsidianMcpConfig, ServiceContainer, ToolContext } from "./types.js";

function asToolResult(data: unknown, isError = false) {
  return {
    isError,
    structuredContent: { result: data } as Record<string, unknown>,
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

export function normalizeError(error: unknown): { code: string; message: string; details?: unknown } {
  if (error instanceof ObsidianMcpError) {
    return { code: error.code, message: error.message, details: error.details };
  }
  if (error instanceof Error) {
    return { code: "INTERNAL_ERROR", message: error.message };
  }
  return { code: "INTERNAL_ERROR", message: "Unknown error" };
}

export async function createToolContext(): Promise<ToolContext> {
  const config = await loadConfig();

  const vaultService = new VaultService(config);
  const noteService = new NoteService(config, vaultService);
  const embeddingService = new EmbeddingService(config.embeddingProvider);
  const indexerService = new IndexerService(config, vaultService, noteService, embeddingService);
  const searchService = new SearchService(config, vaultService, noteService, embeddingService, indexerService);
  const graphService = new GraphService(config, vaultService, noteService);
  const taskService = new TaskService(noteService, vaultService);
  const dailyNoteService = new DailyNoteService(config, vaultService, noteService);
  const templateService = new TemplateService(config, vaultService, noteService);

  const services: ServiceContainer = {
    vaultService,
    noteService,
    searchService,
    graphService,
    taskService,
    dailyNoteService,
    templateService,
    embeddingService,
    indexerService,
  };

  return { config, services };
}

export function createMcpServer(context: ToolContext): McpServer {
  const server = new McpServer({
    name: "obsidian-mcp",
    version: "1.0.0",
    description: "Safe MCP server for local Obsidian vaults with search, graph context, and structured note operations.",
  });

  for (const tool of TOOLS) {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: z.any(),
      },
      async (args: unknown, _extra: unknown) => {
        try {
          const output = await tool.execute(context, (args ?? {}) as Record<string, unknown>);
          return asToolResult(output);
        } catch (error) {
          const normalized = normalizeError(error);
          logger.error("tool_execution_failed", { tool: tool.name, ...normalized });
          return asToolResult({ ok: false, error: normalized }, true);
        }
      },
    );
  }

  registerVaultReadmeResource(server, context.services);
  registerSummarizeVaultPrompt(server, context.services);
  registerResearchContextPrompt(server);

  return server;
}

export function logStartup(config: ObsidianMcpConfig, transport: "stdio" | "http") {
  logger.info("obsidian-mcp_started", {
    transport,
    vault: config.vaultPath,
    semanticSearch: config.enableSemanticSearch,
    tools: TOOLS.length,
  });
}
