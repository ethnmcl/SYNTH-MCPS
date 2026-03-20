import type { ToolDefinition } from '../../core/types.js';
import { createEntityInputSchema } from '../../schemas/entities.js';

export const create_entityTool: ToolDefinition<typeof createEntityInputSchema> = {
  name: 'create_entity',
  description: 'Create a new entity schema in the project.',
  inputSchema: createEntityInputSchema,
  async execute(ctx, input) {
    return ctx.services.entityService.createEntity(input as never);
  }
};
