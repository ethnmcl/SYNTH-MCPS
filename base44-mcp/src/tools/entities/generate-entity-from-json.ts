import type { ToolDefinition } from '../../core/types.js';
import { generateEntityFromJsonInputSchema } from '../../schemas/entities.js';

export const generate_entity_from_jsonTool: ToolDefinition<typeof generateEntityFromJsonInputSchema> = {
  name: 'generate_entity_from_json',
  description: 'Generate an entity schema draft from sample JSON input.',
  inputSchema: generateEntityFromJsonInputSchema,
  async execute(ctx, input) {
    return ctx.services.entityService.generateEntityFromJson(input as never);
  }
};
