import type { ToolDefinition } from '../../core/types.js';
import { listSkillsInputSchema } from '../../schemas/skills.js';

export const list_skillsTool: ToolDefinition<typeof listSkillsInputSchema> = {
  name: 'list_skills',
  description: 'List skills defined for a Base44 project.',
  inputSchema: listSkillsInputSchema,
  async execute(ctx) {
    return ctx.services.skillService.listSkills();
  }
};
