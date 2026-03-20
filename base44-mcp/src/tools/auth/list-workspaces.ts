import type { ToolDefinition } from '../../core/types.js';
import { listWorkspacesInputSchema } from '../../schemas/auth.js';

export const list_workspacesTool: ToolDefinition<typeof listWorkspacesInputSchema> = {
  name: 'list_workspaces',
  description: 'List workspaces available to the current authenticated identity.',
  inputSchema: listWorkspacesInputSchema,
  async execute(ctx) {
    return ctx.services.authService.listWorkspaces();
  }
};
