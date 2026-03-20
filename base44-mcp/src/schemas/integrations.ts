import { z } from 'zod';
import { confirmDangerousSchema } from './common.js';

export const listIntegrationsInputSchema = z.object({ workspaceId: z.string().min(1).optional() }).strict();
export const getIntegrationInputSchema = z.object({ integrationId: z.string().min(1) }).strict();

export const createWorkspaceIntegrationFromOpenapiInputSchema = z
  .object({
    workspaceId: z.string().min(1),
    name: z.string().min(1),
    openapiUrl: z.string().url(),
    authType: z.enum(['none', 'apiKey', 'oauth2']).default('none')
  })
  .strict();

export const updateIntegrationInputSchema = z
  .object({
    integrationId: z.string().min(1),
    name: z.string().optional(),
    config: z.record(z.string(), z.unknown()).optional()
  })
  .strict();

export const deleteIntegrationInputSchema = z
  .object({ integrationId: z.string().min(1), confirmDangerous: confirmDangerousSchema })
  .strict();

export const testIntegrationInputSchema = z
  .object({
    integrationId: z.string().min(1),
    samplePayload: z.record(z.string(), z.unknown()).optional()
  })
  .strict();

export const setIntegrationSecretReferenceInputSchema = z
  .object({
    integrationId: z.string().min(1),
    secretKey: z.string().min(1),
    secretReference: z.string().min(1)
  })
  .strict();
