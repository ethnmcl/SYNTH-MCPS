import type { ToolDefinition } from '../../core/types.js';
import { deleteProjectInputSchema } from '../../schemas/projects.js';

export const delete_projectTool: ToolDefinition<typeof deleteProjectInputSchema> = {
  name: 'delete_project',
  description: 'Delete a Base44 project (destructive, guarded).',
  inputSchema: deleteProjectInputSchema,
  async execute(ctx, input) {
    return ctx.services.projectService.deleteProject(input as never);
  }
};
