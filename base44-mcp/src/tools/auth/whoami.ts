import type { ToolDefinition } from '../../core/types.js';
import { whoamiInputSchema } from '../../schemas/auth.js';

export const whoamiTool: ToolDefinition<typeof whoamiInputSchema> = {
  name: 'whoami',
  description: 'Get the currently authenticated Base44 identity and workspace context.',
  inputSchema: whoamiInputSchema,
  async execute(ctx) {
    return ctx.services.authService.whoami();
  }
};
