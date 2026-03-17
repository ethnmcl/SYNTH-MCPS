import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AppContext } from "../types.js";

async function loadRunbook(fileName: string): Promise<string> {
  const path = resolve(process.cwd(), "src/runbooks", fileName);
  return readFile(path, "utf-8");
}

export function registerResources(server: McpServer, context: AppContext): void {
  server.registerResource(
    "render_projects",
    "render://projects",
    {
      title: "Render Projects",
      description: "List of Render projects",
      mimeType: "application/json"
    },
    async () => {
      const projects = await context.render.listProjects(20);
      return { contents: [{ uri: "render://projects", text: JSON.stringify({ projects }, null, 2) }] };
    }
  );

  server.registerResource(
    "render_project_details",
    "render://projects/{projectId}",
    {
      title: "Render Project Details",
      description: "Project details template resource; pass projectId in tool call for concrete data.",
      mimeType: "application/json"
    },
    async () => ({
      contents: [
        {
          uri: "render://projects/{projectId}",
          text: JSON.stringify(
            {
              usage: "Use list_projects then get project details by ID via tools",
              note: "MCP resource template preserved for resolver compatibility"
            },
            null,
            2
          )
        }
      ]
    })
  );

  server.registerResource(
    "render_services",
    "render://services",
    {
      title: "Render Services",
      description: "List services",
      mimeType: "application/json"
    },
    async () => {
      const services = await context.render.listServices(20);
      return { contents: [{ uri: "render://services", text: JSON.stringify({ services }, null, 2) }] };
    }
  );

  server.registerResource(
    "render_service_details",
    "render://services/{serviceId}",
    {
      title: "Render Service Details",
      description: "Service details template resource",
      mimeType: "application/json"
    },
    async () => ({
      contents: [
        {
          uri: "render://services/{serviceId}",
          text: JSON.stringify(
            {
              usage: "Use get_service_details tool with a concrete serviceId",
              related: [
                "render://services/{serviceId}/deploys",
                "render://services/{serviceId}/logs/recent",
                "render://services/{serviceId}/runtime-summary"
              ]
            },
            null,
            2
          )
        }
      ]
    })
  );

  server.registerResource(
    "render_service_deploys",
    "render://services/{serviceId}/deploys",
    {
      title: "Service Deploys",
      description: "Template for service deploy history",
      mimeType: "application/json"
    },
    async () => ({
      contents: [
        {
          uri: "render://services/{serviceId}/deploys",
          text: JSON.stringify({ usage: "Use list_deploys with concrete serviceId" }, null, 2)
        }
      ]
    })
  );

  server.registerResource(
    "render_service_logs_recent",
    "render://services/{serviceId}/logs/recent",
    {
      title: "Recent Service Logs",
      description: "Template for recent service logs",
      mimeType: "application/json"
    },
    async () => ({
      contents: [
        {
          uri: "render://services/{serviceId}/logs/recent",
          text: JSON.stringify({ usage: "Use get_recent_logs or get_log_snapshot" }, null, 2)
        }
      ]
    })
  );

  server.registerResource(
    "render_runtime_summary",
    "render://services/{serviceId}/runtime-summary",
    {
      title: "Runtime Summary",
      description: "Template for runtime summary",
      mimeType: "application/json"
    },
    async () => ({
      contents: [
        {
          uri: "render://services/{serviceId}/runtime-summary",
          text: JSON.stringify({ usage: "Use get_service_runtime_summary" }, null, 2)
        }
      ]
    })
  );

  server.registerResource(
    "render_env_schema",
    "render://services/{serviceId}/env-schema",
    {
      title: "Service Env Var Schema",
      description: "Template for service env var metadata",
      mimeType: "application/json"
    },
    async () => ({
      contents: [
        {
          uri: "render://services/{serviceId}/env-schema",
          text: JSON.stringify({ usage: "Use list_env_var_metadata" }, null, 2)
        }
      ]
    })
  );

  server.registerResource(
    "render_environments",
    "render://environments",
    {
      title: "Render Environments",
      description: "List environments",
      mimeType: "application/json"
    },
    async () => {
      const environments = await context.render.listEnvironments(20);
      return {
        contents: [{ uri: "render://environments", text: JSON.stringify({ environments }, null, 2) }]
      };
    }
  );

  server.registerResource(
    "render_runbook_deploy_checklist",
    "render://runbooks/deploy-checklist",
    {
      title: "Deploy Checklist Runbook",
      description: "Operational deploy checklist",
      mimeType: "text/markdown"
    },
    async () => ({
      contents: [{ uri: "render://runbooks/deploy-checklist", text: await loadRunbook("deployChecklist.md") }]
    })
  );

  server.registerResource(
    "render_runbook_incident_triage",
    "render://runbooks/incident-triage",
    {
      title: "Incident Triage Runbook",
      description: "Incident triage workflow",
      mimeType: "text/markdown"
    },
    async () => ({
      contents: [{ uri: "render://runbooks/incident-triage", text: await loadRunbook("incidentTriage.md") }]
    })
  );

  server.registerResource(
    "render_runbook_env_audit",
    "render://runbooks/env-audit",
    {
      title: "Env Audit Runbook",
      description: "Environment variable auditing workflow",
      mimeType: "text/markdown"
    },
    async () => ({
      contents: [{ uri: "render://runbooks/env-audit", text: await loadRunbook("envAudit.md") }]
    })
  );
}
