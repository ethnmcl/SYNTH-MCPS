import type { ToolDefinition } from '../../core/types.js';
import { createSkillInputSchema } from '../../schemas/skills.js';

export const create_skillTool: ToolDefinition<typeof createSkillInputSchema> = {
  name: 'create_skill',
  description: 'Create a new project skill definition.',
  inputSchema: createSkillInputSchema,
  async execute(ctx, input) {
    return ctx.services.skillService.createSkill(input as never);
  }
};
