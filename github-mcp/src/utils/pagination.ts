import { z } from 'zod';

export const paginationSchema = z.object({
  per_page: z.number().int().min(1).max(100).default(30),
  page: z.number().int().min(1).default(1)
});
