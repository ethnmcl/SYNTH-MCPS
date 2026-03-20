import type { ToolDefinition } from '../../core/types.js';
import { createConfigJsoncInputSchema } from '../../schemas/files.js';

export const create_config_jsoncTool: ToolDefinition<typeof createConfigJsoncInputSchema> = {
  name: 'create_config_jsonc',
  description: 'Generate a starter base44/config.jsonc from template values.',
  inputSchema: createConfigJsoncInputSchema,
  async execute(ctx, input) {
    return ctx.services.fileService.createConfigJsonc(input as never);
  }
};
