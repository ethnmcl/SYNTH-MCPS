import type { ToolDefinition } from '../../core/types.js';
import { cloneProjectInputSchema } from '../../schemas/projects.js';

export const clone_projectTool: ToolDefinition<typeof cloneProjectInputSchema> = {
  name: 'clone_project',
  description: 'Clone an existing project into a new project in the target workspace.',
  inputSchema: cloneProjectInputSchema,
  async execute(ctx, input) {
    return ctx.services.projectService.cloneProject(input as never);
  }
};
