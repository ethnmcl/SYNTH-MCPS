import { z } from 'zod';

export const searchBase44DocsInputSchema = z.object({ query: z.string().min(1) }).strict();
export const getDocPageInputSchema = z.object({ pageId: z.string().min(1) }).strict();
export const recommendNextStepsInputSchema = z.object({ topic: z.string().min(1) }).strict();
