import { z } from 'zod';
import { confirmDangerousSchema, optionalWorkspaceIdSchema } from './common.js';

export const createProjectInputSchema = z
  .object({
    workspaceId: optionalWorkspaceIdSchema,
    name: z.string().min(1),
    description: z.string().optional(),
    template: z.string().optional()
  })
  .strict();

export const listProjectsInputSchema = z.object({ workspaceId: optionalWorkspaceIdSchema }).strict();
export const getProjectInputSchema = z.object({ projectId: z.string().min(1) }).strict();

export const updateProjectInputSchema = z
  .object({
    projectId: z.string().min(1),
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    archived: z.boolean().optional()
  })
  .strict();

export const deleteProjectInputSchema = z
  .object({
    projectId: z.string().min(1),
    confirmDangerous: confirmDangerousSchema
  })
  .strict();

export const cloneProjectInputSchema = z
  .object({
    sourceProjectId: z.string().min(1),
    targetWorkspaceId: optionalWorkspaceIdSchema,
    newName: z.string().min(1)
  })
  .strict();

export const setActiveProjectInputSchema = z.object({ projectId: z.string().min(1) }).strict();
