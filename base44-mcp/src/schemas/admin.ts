import { z } from 'zod';

export const getServerHealthInputSchema = z.object({}).strict();
export const getAuditLogInputSchema = z.object({}).strict();
export const clearAuditLogInputSchema = z.object({ confirmDangerous: z.boolean() }).strict();
export const getToolMetadataInputSchema = z.object({}).strict();
