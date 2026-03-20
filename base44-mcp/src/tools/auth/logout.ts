import type { ToolDefinition } from '../../core/types.js';
import { logoutInputSchema } from '../../schemas/auth.js';

export const logoutTool: ToolDefinition<typeof logoutInputSchema> = {
  name: 'logout',
  description: 'Log out the active Base44 session and invalidate local auth context.',
  inputSchema: logoutInputSchema,
  async execute(ctx) {
    return ctx.services.authService.logout();
  }
};
