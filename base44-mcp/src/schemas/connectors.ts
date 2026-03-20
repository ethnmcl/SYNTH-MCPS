import { z } from 'zod';

export const listConnectorsInputSchema = z.object({ workspaceId: z.string().min(1).optional() }).strict();
export const getConnectorInputSchema = z.object({ connectorId: z.string().min(1) }).strict();

export const configureConnectorInputSchema = z
  .object({
    connectorId: z.string().min(1),
    config: z.record(z.string(), z.unknown())
  })
  .strict();

export const disconnectConnectorInputSchema = z.object({ connectorId: z.string().min(1) }).strict();
