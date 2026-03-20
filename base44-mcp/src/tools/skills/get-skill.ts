import type { ToolDefinition } from '../../core/types.js';
import { getSkillInputSchema } from '../../schemas/skills.js';

export const get_skillTool: ToolDefinition<typeof getSkillInputSchema> = {
  name: 'get_skill',
  description: 'Get a specific skill definition by skill ID.',
  inputSchema: getSkillInputSchema,
  async execute(ctx, input) {
    return ctx.services.skillService.getSkill(input as never);
  }
};
