import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const serviceInput = z.object({ serviceId: z.string().min(1) });

function message(text: string) {
  return {
    role: "user" as const,
    content: { type: "text" as const, text }
  };
}

export function registerPrompts(server: McpServer): void {
  server.registerPrompt(
    "debug_failed_deploy",
    { description: "Guide AI to debug a failed deploy using incident/deploy/log tools." },
    async (args: unknown) => {
      const parsed = serviceInput.parse(args ?? {});
      return {
        messages: [
          message(
            `Debug failed deploy for service ${parsed.serviceId}. Use analyze_failed_deploy, get_log_snapshot, and suggest_rollback_strategy. Return root cause hypotheses, confidence, and next steps.`
          )
        ]
      };
    }
  );

  server.registerPrompt(
    "prepare_staging_deploy_review",
    { description: "Prepare staging deployment review using runtime/deploy/env tools." },
    async (args: unknown) => {
      const parsed = serviceInput.parse(args ?? {});
      return {
        messages: [
          message(
            `Prepare a staging deploy review for ${parsed.serviceId}. Use prepare_staging_deploy_review, get_service_runtime_summary, list_env_var_metadata, and deployment_risk_assessment.`
          )
        ]
      };
    }
  );

  server.registerPrompt(
    "analyze_logs_for_startup_crash",
    { description: "Analyze logs for startup crash signatures." },
    async (args: unknown) => {
      const parsed = serviceInput.parse(args ?? {});
      return {
        messages: [
          message(
            `Analyze startup crash behavior for ${parsed.serviceId}. Use get_recent_logs with focused window, extract exception stack signals, and propose remediation actions.`
          )
        ]
      };
    }
  );

  server.registerPrompt(
    "audit_env_var_configuration",
    { description: "Audit environment variable configuration posture." },
    async (args: unknown) => {
      const parsed = serviceInput.parse(args ?? {});
      return {
        messages: [
          message(
            `Audit env var configuration for ${parsed.serviceId}. Use list_env_var_metadata and audit_env_var_configuration. Flag key drift and secret posture issues.`
          )
        ]
      };
    }
  );

  server.registerPrompt(
    "review_service_operational_health",
    { description: "Review service operational health and incident readiness." },
    async (args: unknown) => {
      const parsed = serviceInput.parse(args ?? {});
      return {
        messages: [
          message(
            `Review operational health for ${parsed.serviceId}. Use get_service_health_context, get_incident_context, and operational_readiness_check; then provide risk-rated summary.`
          )
        ]
      };
    }
  );

  server.registerPrompt(
    "assess_deployment_risk",
    { description: "Assess deployment risk before release." },
    async (args: unknown) => {
      const parsed = serviceInput.parse(args ?? {});
      return {
        messages: [
          message(
            `Assess deployment risk for ${parsed.serviceId}. Use deployment_risk_assessment and suggest_rollback_strategy. Return go/no-go recommendation.`
          )
        ]
      };
    }
  );

  server.registerPrompt(
    "compare_environment_configurations",
    { description: "Compare staging and production env configuration metadata." },
    async (args: unknown) => {
      const parsed = z
        .object({ stagingServiceId: z.string().min(1), prodServiceId: z.string().min(1) })
        .parse(args ?? {});
      return {
        messages: [
          message(
            `Compare configuration metadata between staging ${parsed.stagingServiceId} and prod ${parsed.prodServiceId}. Use compare_staging_vs_prod_config and audit_env_var_configuration.`
          )
        ]
      };
    }
  );
}
