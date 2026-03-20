import { z } from 'zod';

export const idSchema = z.string().min(1);
export const optionalWorkspaceIdSchema = z.string().min(1).optional();
export const optionalProjectIdSchema = z.string().min(1).optional();
export const confirmDangerousSchema = z.boolean().optional();
export const metadataSchema = z.record(z.string(), z.unknown());
