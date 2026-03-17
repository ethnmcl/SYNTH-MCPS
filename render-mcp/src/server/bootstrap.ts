import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createAppConfig } from "../config/appConfig.js";
import { AuditLogger } from "../lib/auditLogger.js";
import { createLogger } from "../lib/logger.js";
import { PolicyEngine } from "../policy/policyEngine.js";
import { RenderGateway } from "../render/index.js";
import type { AppContext } from "../mcp/types.js";
import { registerPrompts } from "./registerPrompts.js";
import { registerResources } from "./registerResources.js";
import { registerTools } from "./registerTools.js";

export function createAppContext(): AppContext {
  const config = createAppConfig();
  const logger = createLogger(config);
  const auditLogger = new AuditLogger(config.audit.path, logger.child({ component: "audit" }));
  const policyEngine = new PolicyEngine(config);
  const render = new RenderGateway(config, logger.child({ component: "render" }));

  return {
    config,
    logger,
    auditLogger,
    policyEngine,
    render
  };
}

export function createMcpServer(context: AppContext): McpServer {
  const server = new McpServer({
    name: context.config.server.name,
    version: context.config.server.version,
    description: "Controlled AI operator layer for Render infrastructure"
  });

  registerTools(server, context);
  registerResources(server, context);
  registerPrompts(server);

  return server;
}
