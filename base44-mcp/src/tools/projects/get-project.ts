import type { ToolDefinition } from '../../core/types.js';
import { getProjectInputSchema } from '../../schemas/projects.js';

export const get_projectTool: ToolDefinition<typeof getProjectInputSchema> = {
  name: 'get_project',
  description: 'Retrieve details for a single Base44 project by project ID.',
  inputSchema: getProjectInputSchema,
  async execute(ctx, input) {
    return ctx.services.projectService.getProject(input as never);
  }
};
