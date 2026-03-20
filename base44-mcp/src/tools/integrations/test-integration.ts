import type { ToolDefinition } from '../../core/types.js';
import { testIntegrationInputSchema } from '../../schemas/integrations.js';

export const test_integrationTool: ToolDefinition<typeof testIntegrationInputSchema> = {
  name: 'test_integration',
  description: 'Execute a non-destructive integration connectivity test.',
  inputSchema: testIntegrationInputSchema,
  async execute(ctx, input) {
    return ctx.services.integrationService.testIntegration(input as never);
  }
};
