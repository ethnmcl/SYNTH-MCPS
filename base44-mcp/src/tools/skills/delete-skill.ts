import type { ToolDefinition } from '../../core/types.js';
import { deleteSkillInputSchema } from '../../schemas/skills.js';

export const delete_skillTool: ToolDefinition<typeof deleteSkillInputSchema> = {
  name: 'delete_skill',
  description: 'Delete a skill definition (destructive, guarded).',
  inputSchema: deleteSkillInputSchema,
  async execute(ctx, input) {
    return ctx.services.skillService.deleteSkill(input as never);
  }
};
