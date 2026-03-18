import { z } from 'zod';

export const ownerRepoSchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1)
});

export const ownerRepoPathSchema = ownerRepoSchema.extend({
  path: z.string().min(1)
});

export const ownerSchema = z.object({
  owner: z.string().min(1)
});
