import type { ToolDefinition } from '../../core/types.js';
import { listProjectsInputSchema } from '../../schemas/projects.js';

export const list_projectsTool: ToolDefinition<typeof listProjectsInputSchema> = {
  name: 'list_projects',
  description: 'List Base44 projects for the current or specified workspace.',
  inputSchema: listProjectsInputSchema,
  async execute(ctx, input) {
    return ctx.services.projectService.listProjects(input);
  }
};
