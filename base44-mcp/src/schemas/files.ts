import { z } from 'zod';

export const readProjectFileInputSchema = z.object({ path: z.string().min(1) }).strict();

export const writeProjectFileInputSchema = z
  .object({
    path: z.string().min(1),
    content: z.string()
  })
  .strict();

export const listProjectFilesInputSchema = z.object({ path: z.string().min(1).default('.') }).strict();

export const createConfigJsoncInputSchema = z
  .object({
    path: z.string().min(1).optional(),
    workspaceId: z.string().min(1),
    projectId: z.string().min(1),
    projectName: z.string().min(1)
  })
  .strict();
