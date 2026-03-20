import type { ToolDefinition } from '../../core/types.js';
import { updateProjectInputSchema } from '../../schemas/projects.js';

export const update_projectTool: ToolDefinition<typeof updateProjectInputSchema> = {
  name: 'update_project',
  description: 'Update mutable metadata for a Base44 project.',
  inputSchema: updateProjectInputSchema,
  async execute(ctx, input) {
    return ctx.services.projectService.updateProject(input as never);
  }
};
