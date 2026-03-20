import type { ToolDefinition } from '../core/types.js';
import { loginTool } from './auth/login.js';
import { logoutTool } from './auth/logout.js';
import { whoamiTool } from './auth/whoami.js';
import { list_workspacesTool } from './auth/list-workspaces.js';
import { create_projectTool } from './projects/create-project.js';
import { list_projectsTool } from './projects/list-projects.js';
import { get_projectTool } from './projects/get-project.js';
import { update_projectTool } from './projects/update-project.js';
import { delete_projectTool } from './projects/delete-project.js';
import { clone_projectTool } from './projects/clone-project.js';
import { set_active_projectTool } from './projects/set-active-project.js';
import { list_entitiesTool } from './entities/list-entities.js';
import { get_entityTool } from './entities/get-entity.js';
import { create_entityTool } from './entities/create-entity.js';
import { update_entityTool } from './entities/update-entity.js';
import { delete_entityTool } from './entities/delete-entity.js';
import { validate_entity_schemaTool } from './entities/validate-entity-schema.js';
import { generate_entity_from_jsonTool } from './entities/generate-entity-from-json.js';
import { list_functionsTool } from './functions/list-functions.js';
import { get_functionTool } from './functions/get-function.js';
import { create_functionTool } from './functions/create-function.js';
import { update_functionTool } from './functions/update-function.js';
import { delete_functionTool } from './functions/delete-function.js';
import { run_function_localTool } from './functions/run-function-local.js';
import { generate_function_boilerplateTool } from './functions/generate-function-boilerplate.js';
import { list_integrationsTool } from './integrations/list-integrations.js';
import { get_integrationTool } from './integrations/get-integration.js';
import { create_workspace_integration_from_openapiTool } from './integrations/create-workspace-integration-from-openapi.js';
import { update_integrationTool } from './integrations/update-integration.js';
import { delete_integrationTool } from './integrations/delete-integration.js';
import { test_integrationTool } from './integrations/test-integration.js';
import { set_integration_secret_referenceTool } from './integrations/set-integration-secret-reference.js';
import { list_connectorsTool } from './connectors/list-connectors.js';
import { get_connectorTool } from './connectors/get-connector.js';
import { configure_connectorTool } from './connectors/configure-connector.js';
import { disconnect_connectorTool } from './connectors/disconnect-connector.js';
import { list_skillsTool } from './skills/list-skills.js';
import { get_skillTool } from './skills/get-skill.js';
import { create_skillTool } from './skills/create-skill.js';
import { update_skillTool } from './skills/update-skill.js';
import { delete_skillTool } from './skills/delete-skill.js';
import { deploy_projectTool } from './deployments/deploy-project.js';
import { check_deploy_statusTool } from './deployments/check-deploy-status.js';
import { validate_project_structureTool } from './deployments/validate-project-structure.js';
import { sync_local_projectTool } from './deployments/sync-local-project.js';
import { read_project_fileTool } from './files/read-project-file.js';
import { write_project_fileTool } from './files/write-project-file.js';
import { list_project_filesTool } from './files/list-project-files.js';
import { create_config_jsoncTool } from './files/create-config-jsonc.js';
import { search_base44_docsTool } from './docs/search-base44-docs.js';
import { get_doc_pageTool } from './docs/get-doc-page.js';
import { recommend_next_stepsTool } from './docs/recommend-next-steps.js';
import { get_server_healthTool } from './admin/get-server-health.js';
import { get_audit_logTool } from './admin/get-audit-log.js';
import { clear_audit_logTool } from './admin/clear-audit-log.js';
import { get_tool_metadataTool } from './admin/get-tool-metadata.js';

export const allTools: ToolDefinition<any>[] = [
  loginTool,
  logoutTool,
  whoamiTool,
  list_workspacesTool,
  create_projectTool,
  list_projectsTool,
  get_projectTool,
  update_projectTool,
  delete_projectTool,
  clone_projectTool,
  set_active_projectTool,
  list_entitiesTool,
  get_entityTool,
  create_entityTool,
  update_entityTool,
  delete_entityTool,
  validate_entity_schemaTool,
  generate_entity_from_jsonTool,
  list_functionsTool,
  get_functionTool,
  create_functionTool,
  update_functionTool,
  delete_functionTool,
  run_function_localTool,
  generate_function_boilerplateTool,
  list_integrationsTool,
  get_integrationTool,
  create_workspace_integration_from_openapiTool,
  update_integrationTool,
  delete_integrationTool,
  test_integrationTool,
  set_integration_secret_referenceTool,
  list_connectorsTool,
  get_connectorTool,
  configure_connectorTool,
  disconnect_connectorTool,
  list_skillsTool,
  get_skillTool,
  create_skillTool,
  update_skillTool,
  delete_skillTool,
  deploy_projectTool,
  check_deploy_statusTool,
  validate_project_structureTool,
  sync_local_projectTool,
  read_project_fileTool,
  write_project_fileTool,
  list_project_filesTool,
  create_config_jsoncTool,
  search_base44_docsTool,
  get_doc_pageTool,
  recommend_next_stepsTool,
  get_server_healthTool,
  get_audit_logTool,
  clear_audit_logTool,
  get_tool_metadataTool,
];
