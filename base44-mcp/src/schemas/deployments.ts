import { z } from 'zod';

export const deployProjectInputSchema = z
  .object({
    projectId: z.string().min(1),
    environment: z.enum(['dev', 'staging', 'prod']).default('dev')
  })
  .strict();

export const checkDeployStatusInputSchema = z.object({ deploymentId: z.string().min(1) }).strict();

export const validateProjectStructureInputSchema = z
  .object({
    projectRoot: z.string().default('.').optional()
  })
  .strict();

export const syncLocalProjectInputSchema = z
  .object({
    projectRoot: z.string().default('.').optional(),
    mode: z.enum(['push', 'pull']).default('push').optional()
  })
  .strict();
