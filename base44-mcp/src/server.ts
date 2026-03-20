import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Base44Client } from './clients/base44-client.js';
import { DocsClient } from './clients/docs-client.js';
import { LocalProjectClient } from './clients/local-project-client.js';
import { SERVER_NAME, SERVER_VERSION } from './config/constants.js';
import { env } from './config/env.js';
import { registerTools } from './core/tool-registry.js';
import type { AppContext, ServiceContainer } from './core/types.js';
import { AuthService } from './services/auth-service.js';
import { AuditService } from './services/audit-service.js';
import { ConnectorService } from './services/connector-service.js';
import { DeploymentService } from './services/deployment-service.js';
import { DocsService } from './services/docs-service.js';
import { EntityService } from './services/entity-service.js';
import { FileService } from './services/file-service.js';
import { FunctionService } from './services/function-service.js';
import { IntegrationService } from './services/integration-service.js';
import { ProjectService } from './services/project-service.js';
import { SkillService } from './services/skill-service.js';
import { allTools } from './tools/index.js';

export const createAppContext = (): AppContext => {
  const base44Client = new Base44Client(env);
  const localProjectClient = new LocalProjectClient();
  const docsClient = new DocsClient(env);
  const auditService = new AuditService(env);

  const services: ServiceContainer = {
    authService: new AuthService(base44Client, auditService),
    projectService: new ProjectService(base44Client, env, auditService),
    entityService: new EntityService(base44Client, env, auditService),
    functionService: new FunctionService(base44Client, env, auditService),
    integrationService: new IntegrationService(base44Client, env, auditService),
    connectorService: new ConnectorService(base44Client, auditService),
    skillService: new SkillService(base44Client, env, auditService),
    deploymentService: new DeploymentService(base44Client, localProjectClient, auditService),
    fileService: new FileService(localProjectClient, auditService),
    docsService: new DocsService(docsClient),
    auditService
  };

  return {
    env,
    clients: {
      base44Client,
      localProjectClient,
      docsClient
    },
    services,
    toolMetadata: allTools.map((tool) => ({ name: tool.name, description: tool.description }))
  };
};

export const createServer = (): McpServer => {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION
  });

  registerTools(server, createAppContext());
  return server;
};
