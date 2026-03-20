import type { z } from 'zod';
import type { Base44Client } from '../clients/base44-client.js';
import type { DocsClient } from '../clients/docs-client.js';
import type { LocalProjectClient } from '../clients/local-project-client.js';
import type { Env } from '../config/env.js';
import type { AuthService } from '../services/auth-service.js';
import type { AuditService } from '../services/audit-service.js';
import type { ConnectorService } from '../services/connector-service.js';
import type { DeploymentService } from '../services/deployment-service.js';
import type { DocsService } from '../services/docs-service.js';
import type { EntityService } from '../services/entity-service.js';
import type { FileService } from '../services/file-service.js';
import type { FunctionService } from '../services/function-service.js';
import type { IntegrationService } from '../services/integration-service.js';
import type { ProjectService } from '../services/project-service.js';
import type { SkillService } from '../services/skill-service.js';

export type JsonValue = unknown;
export interface JsonObject {
  [key: string]: unknown;
}

export interface ServiceContainer {
  authService: AuthService;
  projectService: ProjectService;
  entityService: EntityService;
  functionService: FunctionService;
  integrationService: IntegrationService;
  connectorService: ConnectorService;
  skillService: SkillService;
  deploymentService: DeploymentService;
  fileService: FileService;
  docsService: DocsService;
  auditService: AuditService;
}

export interface ClientContainer {
  base44Client: Base44Client;
  localProjectClient: LocalProjectClient;
  docsClient: DocsClient;
}

export interface AppContext {
  env: Env;
  clients: ClientContainer;
  services: ServiceContainer;
  toolMetadata: Array<{ name: string; description: string }>;
}

export interface ToolResult<T = JsonObject> {
  summary: string;
  data: T;
}

export interface ToolDefinition<TSchema extends z.ZodTypeAny, TOutput = JsonObject> {
  name: string;
  description: string;
  inputSchema: TSchema;
  execute: (ctx: AppContext, input: z.infer<TSchema>) => Promise<ToolResult<TOutput>>;
}
