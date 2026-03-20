import type { ToolDefinition } from '../../core/types.js';
import { deleteFunctionInputSchema } from '../../schemas/functions.js';

export const delete_functionTool: ToolDefinition<typeof deleteFunctionInputSchema> = {
  name: 'delete_function',
  description: 'Delete a function from a project (destructive, guarded).',
  inputSchema: deleteFunctionInputSchema,
  async execute(ctx, input) {
    return ctx.services.functionService.deleteFunction(input as never);
  }
};
