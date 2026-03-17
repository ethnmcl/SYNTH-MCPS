import { z } from "zod";
import type { AppConfig } from "../config/appConfig.js";
import type { AuditLogger } from "../lib/auditLogger.js";
import type pino from "pino";
import type { PolicyEngine } from "../policy/policyEngine.js";
import type { RenderGateway } from "../render/index.js";

export interface AppContext {
  config: AppConfig;
  logger: pino.Logger;
  auditLogger: AuditLogger;
  policyEngine: PolicyEngine;
  render: RenderGateway;
}

export interface ToolDefinition<TInput extends z.ZodTypeAny = z.ZodTypeAny> {
  name: string;
  description: string;
  inputSchema: TInput;
  outputSchema?: z.ZodTypeAny;
  mutating?: boolean;
  destructive?: boolean;
  handler: (context: AppContext, args: z.infer<TInput>) => Promise<unknown>;
}
