import { z } from "zod";

export const serviceIdSchema = z.string().min(1, "serviceId is required");
export const deployIdSchema = z.string().min(1, "deployId is required");
export const projectIdSchema = z.string().min(1, "projectId is required");

export const dryRunSchema = z.boolean().default(false);
export const approvalTokenSchema = z.string().optional();

export const timeWindowSchema = z
  .object({
    startTime: z.string().datetime().optional(),
    limit: z.number().int().min(1).max(1000).default(200)
  })
  .partial();

export const envVarUpdateSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  isSecret: z.boolean().default(true)
});
