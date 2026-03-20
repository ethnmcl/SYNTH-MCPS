import type { ToolDefinition } from '../../core/types.js';
import { listEntitiesInputSchema } from '../../schemas/entities.js';

export const list_entitiesTool: ToolDefinition<typeof listEntitiesInputSchema> = {
  name: 'list_entities',
  description: 'List entities configured in a Base44 project.',
  inputSchema: listEntitiesInputSchema,
  async execute(ctx, input) {
    return ctx.services.entityService.listEntities(input as never);
  }
};
