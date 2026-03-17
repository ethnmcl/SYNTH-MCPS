import { z } from "zod";
import { successResult } from "../../../lib/result.js";
import { serviceIdSchema } from "../../schemas/common.js";
import type { ToolDefinition } from "../../types.js";

export const phase3Tools: ToolDefinition[] = [
  {
    name: "analyze_failed_deploy",
    description: "Analyze most recent failed deploy and likely root cause.",
    inputSchema: z.object({ serviceId: serviceIdSchema }),
    handler: async (ctx, args) => {
      const [deploys, logs] = await Promise.all([
        ctx.render.listDeploys(args.serviceId, 20),
        ctx.render.getRecentLogs(args.serviceId, 100)
      ]);
      const failed = deploys.find((deploy) => deploy.status.toLowerCase().includes("fail"));
      const errors = logs.filter((line) => /error|crash|exception/i.test(line.message));
      return successResult("Failed deploy analysis complete", {
        failedDeploy: failed,
        errorSample: errors.slice(0, 25),
        hypotheses: [
          failed?.failedReason ?? "No explicit deploy error reason from API",
          errors.some((l) => /migration/i.test(l.message))
            ? "Possible migration/runtime mismatch"
            : "No migration pattern detected"
        ]
      });
    }
  },
  {
    name: "prepare_staging_deploy_review",
    description: "Prepare pre-deploy review context for staging.",
    inputSchema: z.object({ serviceId: serviceIdSchema }),
    handler: async (ctx, args) => {
      const [runtime, deploys] = await Promise.all([
        ctx.render.getRuntimeSummary(args.serviceId),
        ctx.render.listDeploys(args.serviceId, 5)
      ]);
      return successResult("Staging deploy review prepared", {
        runtime,
        recentDeploys: deploys,
        checklist: [
          "Confirm latest deploy passed health checks",
          "Check recent error rate and startup logs",
          "Verify required env var metadata exists"
        ]
      });
    }
  },
  {
    name: "compare_staging_vs_prod_config",
    description: "Compare env var metadata between two services.",
    inputSchema: z.object({
      stagingServiceId: serviceIdSchema,
      prodServiceId: serviceIdSchema
    }),
    handler: async (ctx, args) => {
      const [staging, prod] = await Promise.all([
        ctx.render.listEnvVarMetadata(args.stagingServiceId),
        ctx.render.listEnvVarMetadata(args.prodServiceId)
      ]);
      const stagingKeys = new Set(staging.map((v) => v.key));
      const prodKeys = new Set(prod.map((v) => v.key));

      const missingInProd = [...stagingKeys].filter((key) => !prodKeys.has(key));
      const missingInStaging = [...prodKeys].filter((key) => !stagingKeys.has(key));

      return successResult("Environment configuration comparison generated", {
        missingInProd,
        missingInStaging,
        stagingCount: staging.length,
        prodCount: prod.length
      });
    }
  },
  {
    name: "suggest_rollback_strategy",
    description: "Suggest rollback strategy based on deploy history.",
    inputSchema: z.object({ serviceId: serviceIdSchema }),
    handler: async (ctx, args) => {
      const deploys = await ctx.render.listDeploys(args.serviceId, 10);
      const stable = deploys.find((d) => /live|succeeded|success/i.test(d.status));
      return successResult("Rollback strategy generated", {
        candidateDeploy: stable,
        strategy: stable
          ? [`Rollback to deploy ${stable.id}`, "Validate env var drift", "Monitor logs for 10 minutes"]
          : ["No stable deploy found", "Trigger manual incident response and lock deployments"]
      });
    }
  },
  {
    name: "preview_environment_summary",
    description: "Generate multi-service environment summary.",
    inputSchema: z.object({
      serviceIds: z.array(serviceIdSchema).min(1).max(20)
    }),
    handler: async (ctx, args) => {
      const summaries = await Promise.all(args.serviceIds.map((serviceId: string) => ctx.render.getRuntimeSummary(serviceId)));
      return successResult("Environment summary prepared", {
        services: summaries.map((s) => ({ id: s.service.id, name: s.service.name, health: s.health }))
      });
    }
  },
  {
    name: "audit_env_var_configuration",
    description: "Audit env var metadata quality and secret posture.",
    inputSchema: z.object({ serviceId: serviceIdSchema }),
    handler: async (ctx, args) => {
      const envVars = await ctx.render.listEnvVarMetadata(args.serviceId);
      const risky = envVars.filter((item) => !item.isSecret && /(token|key|secret|password)/i.test(item.key));
      return successResult("Environment variable audit complete", {
        total: envVars.length,
        riskyKeys: risky.map((item) => item.key),
        recommendations: [
          "Mark credential-like variables as secret",
          "Rotate keys if metadata indicates stale updates"
        ]
      });
    }
  },
  {
    name: "operational_readiness_check",
    description: "Check service operational readiness before release.",
    inputSchema: z.object({ serviceId: serviceIdSchema }),
    handler: async (ctx, args) => {
      const [summary, deploy] = await Promise.all([
        ctx.render.getRuntimeSummary(args.serviceId),
        ctx.render.getLatestDeploy(args.serviceId)
      ]);
      const passed =
        !summary.health.signal.some((s) => /high|critical|unavailable/i.test(s)) &&
        Boolean(deploy && /live|success|succeeded/i.test(deploy.status));

      return successResult("Operational readiness evaluated", {
        passed,
        healthSignals: summary.health.signal,
        latestDeployStatus: deploy?.status ?? "unknown"
      });
    }
  },
  {
    name: "deployment_risk_assessment",
    description: "Assess deployment risk from logs, deploy history, and runtime status.",
    inputSchema: z.object({ serviceId: serviceIdSchema }),
    handler: async (ctx, args) => {
      const [deploys, logs, runtime] = await Promise.all([
        ctx.render.listDeploys(args.serviceId, 12),
        ctx.render.getRecentLogs(args.serviceId, 120),
        ctx.render.getRuntimeSummary(args.serviceId)
      ]);

      let riskScore = 0;
      if (deploys.filter((d) => d.status.toLowerCase().includes("fail")).length >= 2) {
        riskScore += 3;
      }
      if (logs.filter((l) => /error|exception|oom|timeout/i.test(l.message)).length > 15) {
        riskScore += 3;
      }
      if (runtime.health.signal.some((s) => /high/i.test(s))) {
        riskScore += 2;
      }

      const riskLevel = riskScore >= 6 ? "high" : riskScore >= 3 ? "medium" : "low";
      return successResult("Deployment risk assessment complete", {
        riskLevel,
        riskScore,
        drivers: {
          failedDeploys: deploys.filter((d) => d.status.toLowerCase().includes("fail")).length,
          errorLogCount: logs.filter((l) => /error|exception|oom|timeout/i.test(l.message)).length,
          healthSignals: runtime.health.signal
        }
      });
    }
  }
];
