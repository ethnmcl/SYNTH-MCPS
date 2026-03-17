import { z } from "zod";
import { ValidationError } from "../../../lib/errors.js";
import { successResult } from "../../../lib/result.js";
import {
  approvalTokenSchema,
  dryRunSchema,
  envVarUpdateSchema,
  serviceIdSchema
} from "../../schemas/common.js";
import type { ToolDefinition } from "../../types.js";

const mutatingBaseSchema = {
  dryRun: dryRunSchema,
  approvalToken: approvalTokenSchema,
  environmentName: z.string().optional(),
  serviceNameOrId: z.string().optional()
};

export const phase2Tools: ToolDefinition[] = [
  {
    name: "trigger_deploy",
    description: "Trigger a service deploy.",
    mutating: true,
    inputSchema: z.object({
      serviceId: serviceIdSchema,
      clearCache: z.boolean().default(false),
      ...mutatingBaseSchema
    }),
    handler: async (ctx, args) => {
      if (args.dryRun) {
        return successResult("Dry run: deploy would be triggered", { target: args.serviceId });
      }
      const deploy = await ctx.render.triggerDeploy(args.serviceId, args.clearCache);
      return successResult("Deploy triggered", { deploy });
    }
  },
  {
    name: "restart_service",
    description: "Restart a service.",
    mutating: true,
    destructive: true,
    inputSchema: z.object({ serviceId: serviceIdSchema, ...mutatingBaseSchema }),
    handler: async (ctx, args) => {
      if (args.dryRun) {
        return successResult("Dry run: service would be restarted", { target: args.serviceId });
      }
      const response = await ctx.render.restartService(args.serviceId);
      return successResult("Service restart requested", { response });
    }
  },
  {
    name: "run_task",
    description: "Run a one-off task for a service.",
    mutating: true,
    inputSchema: z.object({
      serviceId: serviceIdSchema,
      taskName: z.string().min(1),
      ...mutatingBaseSchema
    }),
    handler: async (ctx, args) => {
      if (args.dryRun) {
        return successResult("Dry run: task would execute", {
          serviceId: args.serviceId,
          taskName: args.taskName
        });
      }
      const taskRun = await ctx.render.runTask(args.serviceId, args.taskName);
      return successResult("Task run requested", { taskRun });
    }
  },
  {
    name: "update_env_var",
    description: "Update a single environment variable safely.",
    mutating: true,
    destructive: true,
    inputSchema: z.object({
      serviceId: serviceIdSchema,
      envVar: envVarUpdateSchema,
      ...mutatingBaseSchema
    }),
    handler: async (ctx, args) => {
      if (args.dryRun) {
        return successResult("Dry run: environment variable would update", {
          serviceId: args.serviceId,
          key: args.envVar.key,
          isSecret: args.envVar.isSecret
        });
      }
      const response = await ctx.render.updateEnvVar(args.serviceId, args.envVar);
      return successResult("Environment variable updated", {
        key: args.envVar.key,
        response
      });
    }
  },
  {
    name: "bulk_update_env_vars",
    description: "Bulk update multiple environment variables with strict validation.",
    mutating: true,
    destructive: true,
    inputSchema: z.object({
      serviceId: serviceIdSchema,
      updates: z.array(envVarUpdateSchema).min(1).max(100),
      ...mutatingBaseSchema
    }),
    handler: async (ctx, args) => {
      const keySet = new Set(args.updates.map((item: { key: string }) => item.key));
      if (keySet.size !== args.updates.length) {
        throw new ValidationError("Bulk update contains duplicate env var keys");
      }

      if (args.dryRun) {
        return successResult("Dry run: environment variables would update", {
          serviceId: args.serviceId,
          keys: args.updates.map((item: { key: string }) => item.key)
        });
      }

      const response = await ctx.render.bulkUpdateEnvVars(args.serviceId, args.updates);
      return successResult("Environment variables updated", {
        updatedCount: args.updates.length,
        response
      });
    }
  },
  {
    name: "scale_service",
    description: "Scale service instance counts with bounds validation.",
    mutating: true,
    destructive: true,
    inputSchema: z.object({
      serviceId: serviceIdSchema,
      numInstances: z.number().int().min(1).max(200).optional(),
      minInstances: z.number().int().min(0).max(200).optional(),
      maxInstances: z.number().int().min(1).max(500).optional(),
      ...mutatingBaseSchema
    }),
    handler: async (ctx, args) => {
      if (args.minInstances !== undefined && args.maxInstances !== undefined) {
        if (args.minInstances > args.maxInstances) {
          throw new ValidationError("minInstances cannot exceed maxInstances");
        }
      }

      if (args.dryRun) {
        return successResult("Dry run: service would be scaled", {
          serviceId: args.serviceId,
          scaling: {
            numInstances: args.numInstances,
            minInstances: args.minInstances,
            maxInstances: args.maxInstances
          }
        });
      }

      const response = await ctx.render.scaleService(args.serviceId, {
        numInstances: args.numInstances,
        minInstances: args.minInstances,
        maxInstances: args.maxInstances
      });
      return successResult("Service scale update submitted", { response });
    }
  },
  {
    name: "set_service_suspend_state",
    description: "Set service suspended state.",
    mutating: true,
    destructive: true,
    inputSchema: z.object({
      serviceId: serviceIdSchema,
      suspended: z.boolean(),
      ...mutatingBaseSchema
    }),
    handler: async (ctx, args) => {
      if (args.dryRun) {
        return successResult("Dry run: suspend state would change", {
          serviceId: args.serviceId,
          suspended: args.suspended
        });
      }

      const response = await ctx.render.setServiceSuspendState(args.serviceId, args.suspended);
      return successResult("Service suspend state updated", { response });
    }
  },
  {
    name: "clear_build_cache_if_supported",
    description: "Clear build cache for a service where supported by provider.",
    mutating: true,
    destructive: true,
    inputSchema: z.object({
      serviceId: serviceIdSchema,
      ...mutatingBaseSchema
    }),
    handler: async (ctx, args) => {
      if (args.dryRun) {
        return successResult("Dry run: build cache would clear", { serviceId: args.serviceId });
      }
      const response = await ctx.render.clearBuildCache(args.serviceId);
      return successResult("Build cache clear requested", { response });
    }
  }
];
