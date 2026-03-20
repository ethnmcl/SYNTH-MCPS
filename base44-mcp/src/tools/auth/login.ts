import type { ToolDefinition } from '../../core/types.js';
import { loginInputSchema } from '../../schemas/auth.js';

export const loginTool: ToolDefinition<typeof loginInputSchema> = {
  name: 'login',
  description: 'Authenticate against Base44 and establish a usable session token.',
  inputSchema: loginInputSchema,
  async execute(ctx, input) {
    return ctx.services.authService.login(input as never);
  }
};
