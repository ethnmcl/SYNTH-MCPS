import type { ToolDefinition } from '../../core/types.js';
import { getFunctionInputSchema } from '../../schemas/functions.js';

export const get_functionTool: ToolDefinition<typeof getFunctionInputSchema> = {
  name: 'get_function',
  description: 'Get one function definition and metadata.',
  inputSchema: getFunctionInputSchema,
  async execute(ctx, input) {
    return ctx.services.functionService.getFunction(input as never);
  }
};
