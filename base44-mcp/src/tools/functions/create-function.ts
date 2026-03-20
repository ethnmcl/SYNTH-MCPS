import type { ToolDefinition } from '../../core/types.js';
import { createFunctionInputSchema } from '../../schemas/functions.js';

export const create_functionTool: ToolDefinition<typeof createFunctionInputSchema> = {
  name: 'create_function',
  description: 'Create a function in the specified project.',
  inputSchema: createFunctionInputSchema,
  async execute(ctx, input) {
    return ctx.services.functionService.createFunction(input as never);
  }
};
