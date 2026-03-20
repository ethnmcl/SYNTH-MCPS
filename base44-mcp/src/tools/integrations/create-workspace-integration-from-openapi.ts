import type { ToolDefinition } from '../../core/types.js';
import { createWorkspaceIntegrationFromOpenapiInputSchema } from '../../schemas/integrations.js';

export const create_workspace_integration_from_openapiTool: ToolDefinition<typeof createWorkspaceIntegrationFromOpenapiInputSchema> = {
  name: 'create_workspace_integration_from_openapi',
  description: 'Create a workspace integration from an OpenAPI specification URL.',
  inputSchema: createWorkspaceIntegrationFromOpenapiInputSchema,
  async execute(ctx, input) {
    return ctx.services.integrationService.createWorkspaceIntegrationFromOpenapi(input as never);
  }
};
