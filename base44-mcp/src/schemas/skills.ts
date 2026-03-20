import { z } from 'zod';
import { confirmDangerousSchema } from './common.js';

export const listSkillsInputSchema = z.object({ projectId: z.string().min(1).optional() }).strict();
export const getSkillInputSchema = z.object({ skillId: z.string().min(1) }).strict();

export const createSkillInputSchema = z
  .object({
    projectId: z.string().min(1),
    name: z.string().min(1),
    markdown: z.string().min(1)
  })
  .strict();

export const updateSkillInputSchema = z
  .object({
    skillId: z.string().min(1),
    name: z.string().optional(),
    markdown: z.string().optional()
  })
  .strict();

export const deleteSkillInputSchema = z
  .object({ skillId: z.string().min(1), confirmDangerous: confirmDangerousSchema })
  .strict();
