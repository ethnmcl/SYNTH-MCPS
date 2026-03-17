import type {
  Deploy,
  EnvVarMetadata,
  Environment,
  LogLine,
  Project,
  Service,
  TaskRunResult
} from "./models.js";

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

function getByPath(raw: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = raw;

  for (const part of parts) {
    const currentRecord = asRecord(current);
    if (!currentRecord) {
      return undefined;
    }
    current = currentRecord[part];
  }

  return current;
}

function getString(raw: Record<string, unknown>, paths: string[]): string | undefined {
  for (const path of paths) {
    const value = getByPath(raw, path);
    const asStr = asString(value);
    if (asStr !== undefined) {
      return asStr;
    }
  }
  return undefined;
}

function getBoolean(raw: Record<string, unknown>, paths: string[]): boolean | undefined {
  for (const path of paths) {
    const value = getByPath(raw, path);
    if (typeof value === "boolean") {
      return value;
    }
  }
  return undefined;
}

export function mapService(raw: Record<string, unknown>): Service {
  return {
    id: getString(raw, ["id", "service.id"]) ?? "",
    name: getString(raw, ["name", "service.name"]) ?? "unknown",
    type: getString(raw, ["type", "service.type"]) ?? "unknown",
    environmentId: getString(raw, ["environmentId", "envId", "environment.id", "service.environmentId"]),
    environmentName: getString(raw, [
      "environmentName",
      "environment",
      "env",
      "environment.name",
      "service.environmentName"
    ]),
    projectId: getString(raw, ["projectId", "project.id", "service.projectId"]),
    suspended: getBoolean(raw, ["suspended", "service.suspended"]),
    status: getString(raw, ["status", "service.status"]),
    repo: getString(raw, ["repo", "repoUrl", "service.repo", "service.repoUrl"]),
    branch: getString(raw, ["branch", "service.branch"]),
    region: getString(raw, ["region", "service.region"]),
    plan: getString(raw, ["plan", "service.plan"]),
    updatedAt: getString(raw, ["updatedAt", "service.updatedAt"])
  };
}

export function mapDeploy(raw: Record<string, unknown>, serviceIdFallback = ""): Deploy {
  return {
    id: getString(raw, ["id", "deploy.id"]) ?? "",
    serviceId: getString(raw, ["serviceId", "service.id", "deploy.serviceId"]) ?? serviceIdFallback,
    status: getString(raw, ["status", "deploy.status"]) ?? "unknown",
    commitId: getString(raw, ["commitId", "commit.id", "deploy.commitId"]),
    trigger: getString(raw, ["trigger", "deploy.trigger"]),
    createdAt: getString(raw, ["createdAt", "deploy.createdAt"]),
    updatedAt: getString(raw, ["updatedAt", "deploy.updatedAt"]),
    finishedAt: getString(raw, ["finishedAt", "deploy.finishedAt"]),
    failedReason: getString(raw, ["failedReason", "error", "message", "deploy.failedReason"])
  };
}

export function mapProject(raw: Record<string, unknown>): Project {
  return {
    id: getString(raw, ["id", "project.id"]) ?? "",
    name: getString(raw, ["name", "project.name"]) ?? "unknown",
    ownerId: getString(raw, ["ownerId", "project.ownerId"]),
    createdAt: getString(raw, ["createdAt", "project.createdAt"]),
    updatedAt: getString(raw, ["updatedAt", "project.updatedAt"])
  };
}

export function mapEnvironment(raw: Record<string, unknown>): Environment {
  return {
    id: getString(raw, ["id", "environment.id"]) ?? "",
    name: getString(raw, ["name", "environment.name"]) ?? "unknown",
    projectId: getString(raw, ["projectId", "environment.projectId"]),
    createdAt: getString(raw, ["createdAt", "environment.createdAt"])
  };
}

export function mapLogLine(raw: Record<string, unknown>): LogLine {
  return {
    timestamp: getString(raw, ["timestamp", "time", "log.timestamp"]) ?? new Date().toISOString(),
    level: getString(raw, ["level", "severity", "log.level"]),
    message: getString(raw, ["message", "msg", "log.message"]) ?? ""
  };
}

export function mapEnvVarMetadata(raw: Record<string, unknown>): EnvVarMetadata {
  const key = getString(raw, ["key", "envVar.key", "name"]) ?? "unknown";
  const value = getString(raw, ["value", "envVar.value"]);
  const isSecret = getBoolean(raw, ["secret", "isSecret", "envVar.secret"]) ?? true;

  return {
    key,
    isSecret,
    valueHint: value ? `${value.slice(0, 2)}***` : undefined,
    syncedFrom: getString(raw, ["syncedFrom", "source"]),
    lastUpdatedAt: getString(raw, ["updatedAt", "envVar.updatedAt"])
  };
}

export function mapTaskRunResult(raw: Record<string, unknown>): TaskRunResult {
  return {
    id: getString(raw, ["id", "task.id", "run.id"]) ?? "",
    status: getString(raw, ["status", "task.status", "run.status"]) ?? "unknown",
    startedAt: getString(raw, ["startedAt", "task.startedAt", "run.startedAt"]),
    finishedAt: getString(raw, ["finishedAt", "task.finishedAt", "run.finishedAt"])
  };
}
