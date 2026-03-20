import { z } from 'zod';

export const loginInputSchema = z
  .object({
    authCode: z.string().min(1).optional(),
    useRefreshToken: z.boolean().default(true)
  })
  .strict();

export const logoutInputSchema = z.object({}).strict();
export const whoamiInputSchema = z.object({}).strict();
export const listWorkspacesInputSchema = z.object({}).strict();
