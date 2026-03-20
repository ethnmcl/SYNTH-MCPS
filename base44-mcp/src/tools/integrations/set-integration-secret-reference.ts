import type { ToolDefinition } from '../../core/types.js';
import { setIntegrationSecretReferenceInputSchema } from '../../schemas/integrations.js';

export const set_integration_secret_referenceTool: ToolDefinition<typeof setIntegrationSecretReferenceInputSchema> = {
  name: 'set_integration_secret_reference',
  description: 'Bind an integration key to a secret reference identifier.',
  inputSchema: setIntegrationSecretReferenceInputSchema,
  async execute(ctx, input) {
    return ctx.services.integrationService.setIntegrationSecretReference(input as never);
  }
};
