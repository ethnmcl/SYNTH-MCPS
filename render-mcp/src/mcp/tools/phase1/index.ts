import { z } from "zod";
import { successResult } from "../../../lib/result.js";
import { deployIdSchema, serviceIdSchema, timeWindowSchema } from "../../schemas/common.js";
import type { ToolDefinition } from "../../types.js";

export const phase1Tools: ToolDefinition[] = [
  {
    name: "list_services",
    description: "List Render services with optional limit.",
    inputSchema: z.object({
      limit: z.number().int().min(1).max(50).default(20)
    }),
    handler: async (ctx, args) => {
      const services = await ctx.render.listServices(args.limit);
      return successResult("Services retrieved", { count: services.length, services });
    }
  },
  {
    name: "get_service_details",
    description: "Get detailed service metadata by service ID.",
    inputSchema: z.object({ serviceId: serviceIdSchema }),
    handler: async (ctx, args) => {
      const service = await ctx.render.getService(args.serviceId);
      return successResult("Service details retrieved", { service });
    }
  },
  {
    name: "list_projects",
    description: "List Render projects.",
    inputSchema: z.object({ limit: z.number().int().min(1).max(50).default(20) }),
    handler: async (ctx, args) => {
      const projects = await ctx.render.listProjects(args.limit);
      return successResult("Projects retrieved", { count: projects.length, projects });
    }
  },
  {
    name: "list_environments",
    description: "List Render environments.",
    inputSchema: z.object({ limit: z.number().int().min(1).max(50).default(20) }),
    handler: async (ctx, args) => {
      const environments = await ctx.render.listEnvironments(args.limit);
      return successResult("Environments retrieved", { count: environments.length, environments });
    }
  },
  {
    name: "get_latest_deploy",
    description: "Get latest deploy for a service.",
    inputSchema: z.object({ serviceId: serviceIdSchema }),
    handler: async (ctx, args) => {
      const deploy = await ctx.render.getLatestDeploy(args.serviceId);
      return successResult("Latest deploy retrieved", { deploy });
    }
  },
  {
    name: "list_deploys",
    description: "List deploys for a service.",
    inputSchema: z.object({
      serviceId: serviceIdSchema,
      limit: z.number().int().min(1).max(100).default(20)
    }),
    handler: async (ctx, args) => {
      const deploys = await ctx.render.listDeploys(args.serviceId, args.limit);
      return successResult("Deploy history retrieved", { count: deploys.length, deploys });
    }
  },
  {
    name: "get_deploy_status",
    description: "Get deploy status for a service deploy ID.",
    inputSchema: z.object({ serviceId: serviceIdSchema, deployId: deployIdSchema }),
    handler: async (ctx, args) => {
      const deploy = await ctx.render.getDeploy(args.serviceId, args.deployId);
      return successResult("Deploy status retrieved", { deployId: deploy.id, status: deploy.status, deploy });
    }
  },
  {
    name: "get_recent_logs",
    description: "Fetch recent logs for a service with optional time window.",
    inputSchema: z.object({
      serviceId: serviceIdSchema,
      ...timeWindowSchema.shape
    }),
    handler: async (ctx, args) => {
      const logs = await ctx.render.getRecentLogs(args.serviceId, args.limit ?? 200, args.startTime);
      return successResult("Recent logs retrieved", { count: logs.length, logs });
    }
  },
  {
    name: "get_log_snapshot",
    description: "Get compact log snapshot for quick debugging.",
    inputSchema: z.object({
      serviceId: serviceIdSchema,
      limit: z.number().int().min(1).max(300).default(80)
    }),
    handler: async (ctx, args) => {
      const logs = await ctx.render.getRecentLogs(args.serviceId, args.limit);
      const sample = logs.slice(-args.limit);
      return successResult("Log snapshot created", { count: sample.length, sample });
    }
  },
  {
    name: "list_env_var_metadata",
    description: "List environment variable metadata without raw secret values.",
    inputSchema: z.object({ serviceId: serviceIdSchema }),
    handler: async (ctx, args) => {
      const envVars = await ctx.render.listEnvVarMetadata(args.serviceId);
      return successResult("Environment variable metadata retrieved", { count: envVars.length, envVars });
    }
  },
  {
    name: "get_service_runtime_summary",
    description: "Get aggregated runtime summary for service state, deploy and health signals.",
    inputSchema: z.object({ serviceId: serviceIdSchema }),
    handler: async (ctx, args) => {
      const summary = await ctx.render.getRuntimeSummary(args.serviceId);
      return successResult("Runtime summary generated", { summary });
    }
  },
  {
    name: "get_service_health_context",
    description: "Get health-oriented context for service troubleshooting.",
    inputSchema: z.object({ serviceId: serviceIdSchema }),
    handler: async (ctx, args) => {
      const [summary, logs] = await Promise.all([
        ctx.render.getRuntimeSummary(args.serviceId),
        ctx.render.getRecentLogs(args.serviceId, 60)
      ]);
      const errors = logs.filter((line) => line.message.toLowerCase().includes("error"));
      return successResult("Service health context generated", {
        summary,
        recentErrorCount: errors.length,
        recentErrors: errors.slice(0, 20)
      });
    }
  },
  {
    name: "get_incident_context",
    description: "Summarize recent incidents using deploy failures, status and logs.",
    inputSchema: z.object({ serviceId: serviceIdSchema }),
    handler: async (ctx, args) => {
      const incident = await ctx.render.getIncidentContext(args.serviceId);
      return successResult("Incident context generated", { incident });
    }
  }
];
