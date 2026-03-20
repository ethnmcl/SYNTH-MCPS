import type { ToolDefinition } from '../../core/types.js';
import { updateEntityInputSchema } from '../../schemas/entities.js';

export const update_entityTool: ToolDefinition<typeof updateEntityInputSchema> = {
  name: 'update_entity',
  description: 'Update an existing entity schema definition.',
  inputSchema: updateEntityInputSchema,
  async execute(ctx, input) {
    return ctx.services.entityService.updateEntity(input as never);
  }
};
