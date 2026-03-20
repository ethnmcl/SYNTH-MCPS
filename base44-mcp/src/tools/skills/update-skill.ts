import type { ToolDefinition } from '../../core/types.js';
import { updateSkillInputSchema } from '../../schemas/skills.js';

export const update_skillTool: ToolDefinition<typeof updateSkillInputSchema> = {
  name: 'update_skill',
  description: 'Update skill metadata or markdown content.',
  inputSchema: updateSkillInputSchema,
  async execute(ctx, input) {
    return ctx.services.skillService.updateSkill(input as never);
  }
};
