import type { ToolDefinition } from '../../core/types.js';
import { updateFunctionInputSchema } from '../../schemas/functions.js';

export const update_functionTool: ToolDefinition<typeof updateFunctionInputSchema> = {
  name: 'update_function',
  description: 'Update function code or metadata.',
  inputSchema: updateFunctionInputSchema,
  async execute(ctx, input) {
    return ctx.services.functionService.updateFunction(input as never);
  }
};
