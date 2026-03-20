import type { ToolDefinition } from '../../core/types.js';
import { validateEntitySchemaInputSchema } from '../../schemas/entities.js';

export const validate_entity_schemaTool: ToolDefinition<typeof validateEntitySchemaInputSchema> = {
  name: 'validate_entity_schema',
  description: 'Validate an entity schema payload before persisting.',
  inputSchema: validateEntitySchemaInputSchema,
  async execute(ctx, input) {
    return ctx.services.entityService.validateEntitySchema(input as never);
  }
};
