import type { ToolDefinition } from '../../core/types.js';
import { validateProjectStructureInputSchema } from '../../schemas/deployments.js';

export const validate_project_structureTool: ToolDefinition<typeof validateProjectStructureInputSchema> = {
  name: 'validate_project_structure',
  description: 'Validate local Base44 project folders/files and suggest fixes.',
  inputSchema: validateProjectStructureInputSchema,
  async execute(ctx, input) {
    return ctx.services.deploymentService.validateProjectStructure(input as never);
  }
};
