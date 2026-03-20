import { z } from 'zod';
import { confirmDangerousSchema, optionalProjectIdSchema } from './common.js';

export const listEntitiesInputSchema = z.object({ projectId: optionalProjectIdSchema }).strict();
export const getEntityInputSchema = z.object({ entityId: z.string().min(1) }).strict();

export const createEntityInputSchema = z
  .object({
    projectId: z.string().min(1),
    name: z.string().min(1),
    schema: z.record(z.string(), z.unknown())
  })
  .strict();

export const updateEntityInputSchema = z
  .object({
    entityId: z.string().min(1),
    name: z.string().min(1).optional(),
    schema: z.record(z.string(), z.unknown()).optional()
  })
  .strict();

export const deleteEntityInputSchema = z
  .object({ entityId: z.string().min(1), confirmDangerous: confirmDangerousSchema })
  .strict();

export const validateEntitySchemaInputSchema = z
  .object({
    schema: z.record(z.string(), z.unknown())
  })
  .strict();

export const generateEntityFromJsonInputSchema = z
  .object({
    name: z.string().min(1),
    jsonExample: z.record(z.string(), z.unknown())
  })
  .strict();
