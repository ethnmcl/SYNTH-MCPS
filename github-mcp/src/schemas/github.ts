import { z } from 'zod';

export const refSchema = z.string().min(1);
export const issueNumberSchema = z.number().int().positive();
export const pullNumberSchema = z.number().int().positive();
export const workflowIdSchema = z.union([z.number().int().positive(), z.string().min(1)]);
