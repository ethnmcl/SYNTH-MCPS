import type { ToolDefinition } from '../../core/types.js';
import { setActiveProjectInputSchema } from '../../schemas/projects.js';

export const set_active_projectTool: ToolDefinition<typeof setActiveProjectInputSchema> = {
  name: 'set_active_project',
  description: 'Set the active project context for this MCP process.',
  inputSchema: setActiveProjectInputSchema,
  async execute(ctx, input) {
    return ctx.services.projectService.setActiveProject(input as never);
  }
};
