import type { ToolDefinition } from '../../core/types.js';
import { getEntityInputSchema } from '../../schemas/entities.js';

export const get_entityTool: ToolDefinition<typeof getEntityInputSchema> = {
  name: 'get_entity',
  description: 'Get one entity with schema details by entity ID.',
  inputSchema: getEntityInputSchema,
  async execute(ctx, input) {
    return ctx.services.entityService.getEntity(input as never);
  }
};
