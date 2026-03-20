import type { ToolDefinition } from '../../core/types.js';
import { runFunctionLocalInputSchema } from '../../schemas/functions.js';

export const run_function_localTool: ToolDefinition<typeof runFunctionLocalInputSchema> = {
  name: 'run_function_local',
  description: 'Run a function in local mock runtime for fast feedback.',
  inputSchema: runFunctionLocalInputSchema,
  async execute(ctx, input) {
    return ctx.services.functionService.runFunctionLocal(input as never);
  }
};
