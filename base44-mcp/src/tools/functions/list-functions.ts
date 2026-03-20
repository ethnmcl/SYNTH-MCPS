import type { ToolDefinition } from '../../core/types.js';
import { listFunctionsInputSchema } from '../../schemas/functions.js';

export const list_functionsTool: ToolDefinition<typeof listFunctionsInputSchema> = {
  name: 'list_functions',
  description: 'List functions available in a project.',
  inputSchema: listFunctionsInputSchema,
  async execute(ctx, input) {
    return ctx.services.functionService.listFunctions(input as never);
  }
};
