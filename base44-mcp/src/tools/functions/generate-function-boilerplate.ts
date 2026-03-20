import type { ToolDefinition } from '../../core/types.js';
import { generateFunctionBoilerplateInputSchema } from '../../schemas/functions.js';

export const generate_function_boilerplateTool: ToolDefinition<typeof generateFunctionBoilerplateInputSchema> = {
  name: 'generate_function_boilerplate',
  description: 'Generate starter function boilerplate from built-in templates.',
  inputSchema: generateFunctionBoilerplateInputSchema,
  async execute(ctx, input) {
    return ctx.services.functionService.generateFunctionBoilerplate(input as never);
  }
};
