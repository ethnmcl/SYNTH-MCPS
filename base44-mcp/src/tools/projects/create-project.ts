import type { ToolDefinition } from '../../core/types.js';
import { createProjectInputSchema } from '../../schemas/projects.js';

export const create_projectTool: ToolDefinition<typeof createProjectInputSchema> = {
  name: 'create_project',
  description: 'Create a Base44 backend project with optional template metadata.',
  inputSchema: createProjectInputSchema,
  async execute(ctx, input) {
    return ctx.services.projectService.createProject(input as never);
  }
};
