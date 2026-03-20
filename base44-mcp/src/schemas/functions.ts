import { z } from 'zod';
import { confirmDangerousSchema, optionalProjectIdSchema } from './common.js';

export const listFunctionsInputSchema = z.object({ projectId: optionalProjectIdSchema }).strict();
export const getFunctionInputSchema = z.object({ functionId: z.string().min(1) }).strict();

export const createFunctionInputSchema = z
  .object({
    projectId: z.string().min(1),
    name: z.string().min(1),
    code: z.string().min(1),
    runtime: z.string().default('node')
  })
  .strict();

export const updateFunctionInputSchema = z
  .object({
    functionId: z.string().min(1),
    code: z.string().optional(),
    runtime: z.string().optional(),
    name: z.string().optional()
  })
  .strict();

export const deleteFunctionInputSchema = z
  .object({ functionId: z.string().min(1), confirmDangerous: confirmDangerousSchema })
  .strict();

export const runFunctionLocalInputSchema = z
  .object({
    functionName: z.string().min(1),
    payload: z.record(z.string(), z.unknown()).optional()
  })
  .strict();

export const generateFunctionBoilerplateInputSchema = z.object({ functionName: z.string().min(1) }).strict();
