import type pino from "pino";
import type { AppConfig } from "../config/appConfig.js";
import { UnsupportedOperationError } from "../lib/errors.js";
import { RenderClient } from "./client.js";
import { DeploysEndpoint } from "./endpoints/deploys.js";
import { EnvironmentsEndpoint } from "./endpoints/environments.js";
import { EnvVarsEndpoint, type EnvVarUpdate } from "./endpoints/envVars.js";
import { LogsEndpoint } from "./endpoints/logs.js";
import { MetricsEndpoint } from "./endpoints/metrics.js";
import { ProjectsEndpoint } from "./endpoints/projects.js";
import { ServicesEndpoint } from "./endpoints/services.js";
import { TasksEndpoint } from "./endpoints/tasks.js";
import type { Deploy, IncidentContext, RuntimeSummary } from "./models.js";

export class RenderGateway {
  private readonly servicesEndpoint: ServicesEndpoint;
  private readonly deploysEndpoint: DeploysEndpoint;
  private readonly logsEndpoint: LogsEndpoint;
  private readonly envVarsEndpoint: EnvVarsEndpoint;
  private readonly projectsEndpoint: ProjectsEndpoint;
  private readonly environmentsEndpoint: EnvironmentsEndpoint;
  private readonly tasksEndpoint: TasksEndpoint;
  private readonly metricsEndpoint: MetricsEndpoint;

  public constructor(config: AppConfig, logger: pino.Logger) {
    const client = new RenderClient(config, logger.child({ component: "render-client" }));
    this.servicesEndpoint = new ServicesEndpoint(client);
    this.deploysEndpoint = new DeploysEndpoint(client);
    this.logsEndpoint = new LogsEndpoint(client);
    this.envVarsEndpoint = new EnvVarsEndpoint(client);
    this.projectsEndpoint = new ProjectsEndpoint(client);
    this.environmentsEndpoint = new EnvironmentsEndpoint(client);
    this.tasksEndpoint = new TasksEndpoint(client);
    this.metricsEndpoint = new MetricsEndpoint(client);
  }

  public async listServices(limit = 100) {
    return this.servicesEndpoint.listServices(limit);
  }

  public async getService(serviceId: string) {
    return this.servicesEndpoint.getService(serviceId);
  }

  public async listDeploys(serviceId: string, limit = 20) {
    return this.deploysEndpoint.listDeploys(serviceId, limit);
  }

  public async getLatestDeploy(serviceId: string) {
    return this.deploysEndpoint.getLatestDeploy(serviceId);
  }

  public async getDeploy(serviceId: string, deployId: string) {
    return this.deploysEndpoint.getDeploy(serviceId, deployId);
  }

  public async getRecentLogs(serviceId: string, limit = 200, startTime?: string) {
    return this.logsEndpoint.getRecentLogs(serviceId, limit, startTime);
  }

  public async listEnvVarMetadata(serviceId: string) {
    return this.envVarsEndpoint.listMetadata(serviceId);
  }

  public async listProjects(limit = 100) {
    return this.projectsEndpoint.listProjects(limit);
  }

  public async getProject(projectId: string) {
    return this.projectsEndpoint.getProject(projectId);
  }

  public async listEnvironments(limit = 100) {
    return this.environmentsEndpoint.listEnvironments(limit);
  }

  public async triggerDeploy(serviceId: string, clearCache?: boolean): Promise<Deploy> {
    return this.deploysEndpoint.triggerDeploy(serviceId, clearCache);
  }

  public async restartService(serviceId: string): Promise<Record<string, unknown>> {
    return this.servicesEndpoint.restartService(serviceId);
  }

  public async runTask(serviceId: string, taskName: string) {
    return this.tasksEndpoint.runTask(serviceId, taskName);
  }

  public async updateEnvVar(serviceId: string, update: EnvVarUpdate): Promise<Record<string, unknown>> {
    return this.envVarsEndpoint.updateOne(serviceId, update);
  }

  public async bulkUpdateEnvVars(
    serviceId: string,
    updates: EnvVarUpdate[]
  ): Promise<Record<string, unknown>> {
    return this.envVarsEndpoint.bulkUpdate(serviceId, updates);
  }

  public async scaleService(
    serviceId: string,
    payload: { numInstances?: number; minInstances?: number; maxInstances?: number }
  ): Promise<Record<string, unknown>> {
    return this.servicesEndpoint.scaleService(serviceId, payload);
  }

  public async setServiceSuspendState(serviceId: string, suspended: boolean): Promise<Record<string, unknown>> {
    return this.servicesEndpoint.setSuspendState(serviceId, suspended);
  }

  public async clearBuildCache(serviceId: string): Promise<Record<string, unknown>> {
    return this.servicesEndpoint.clearBuildCache(serviceId);
  }

  public async getRuntimeSummary(serviceId: string): Promise<RuntimeSummary> {
    const [service, latestDeploy] = await Promise.all([
      this.getService(serviceId),
      this.getLatestDeploy(serviceId)
    ]);

    let healthSignals: string[] = [];

    try {
      const metrics = await this.metricsEndpoint.getServiceMetricsSummary(serviceId);
      if (metrics.errorRatePct !== undefined && metrics.errorRatePct > 5) {
        healthSignals.push(`High error rate: ${metrics.errorRatePct}%`);
      }
      if (metrics.cpuPct !== undefined && metrics.cpuPct > 90) {
        healthSignals.push(`High CPU: ${metrics.cpuPct}%`);
      }
      if (metrics.memoryMb !== undefined && metrics.memoryMb > 1500) {
        healthSignals.push(`High memory: ${metrics.memoryMb}MB`);
      }
    } catch (error) {
      if (!(error instanceof UnsupportedOperationError)) {
        throw error;
      }
      healthSignals = ["Metrics endpoint unavailable; summary based on service/deploy state only"];
    }

    return {
      service,
      latestDeploy,
      health: {
        status: service.status ?? "unknown",
        signal: healthSignals.length > 0 ? healthSignals : ["No critical signals"]
      }
    };
  }

  public async getIncidentContext(serviceId: string): Promise<IncidentContext> {
    const [deploys, logs, service] = await Promise.all([
      this.listDeploys(serviceId, 10),
      this.getRecentLogs(serviceId, 80),
      this.getService(serviceId)
    ]);

    const failedDeploys = deploys.filter((deploy) => deploy.status.toLowerCase().includes("fail"));

    const suspectedCauses: string[] = [];
    if (failedDeploys.length > 0) {
      suspectedCauses.push("Recent deploy failures detected");
    }
    if (logs.some((line) => line.message.toLowerCase().includes("crash"))) {
      suspectedCauses.push("Crash patterns seen in recent logs");
    }
    if (logs.some((line) => line.message.toLowerCase().includes("timeout"))) {
      suspectedCauses.push("Timeout errors seen in recent logs");
    }

    return {
      serviceId,
      recentFailedDeploys: failedDeploys,
      recentLogs: logs,
      healthStatus: service.status ?? "unknown",
      suspectedCauses: suspectedCauses.length > 0 ? suspectedCauses : ["No obvious cause from recent telemetry"]
    };
  }
}
