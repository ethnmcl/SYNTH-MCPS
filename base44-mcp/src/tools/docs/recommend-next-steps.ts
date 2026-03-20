import type { ToolDefinition } from '../../core/types.js';
import { recommendNextStepsInputSchema } from '../../schemas/docs.js';

export const recommend_next_stepsTool: ToolDefinition<typeof recommendNextStepsInputSchema> = {
  name: 'recommend_next_steps',
  description: 'Recommend next implementation steps for a given Base44 topic.',
  inputSchema: recommendNextStepsInputSchema,
  async execute(ctx, input) {
    return ctx.services.docsService.recommendNextSteps(input as never);
  }
};
