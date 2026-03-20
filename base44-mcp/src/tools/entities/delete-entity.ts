import type { ToolDefinition } from '../../core/types.js';
import { deleteEntityInputSchema } from '../../schemas/entities.js';

export const delete_entityTool: ToolDefinition<typeof deleteEntityInputSchema> = {
  name: 'delete_entity',
  description: 'Delete an entity from the project (destructive, guarded).',
  inputSchema: deleteEntityInputSchema,
  async execute(ctx, input) {
    return ctx.services.entityService.deleteEntity(input as never);
  }
};
