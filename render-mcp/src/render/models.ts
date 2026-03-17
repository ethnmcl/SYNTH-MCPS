export interface RenderPagination {
  cursor?: string;
  hasMore?: boolean;
}

export interface Service {
  id: string;
  name: string;
  type: string;
  environmentId?: string;
  environmentName?: string;
  projectId?: string;
  suspended?: boolean;
  status?: string;
  repo?: string;
  branch?: string;
  region?: string;
  plan?: string;
  updatedAt?: string;
}

export interface Deploy {
  id: string;
  serviceId: string;
  status: string;
  commitId?: string;
  trigger?: string;
  createdAt?: string;
  updatedAt?: string;
  finishedAt?: string;
  failedReason?: string;
}

export interface Project {
  id: string;
  name: string;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Environment {
  id: string;
  name: string;
  projectId?: string;
  createdAt?: string;
}

export interface LogLine {
  timestamp: string;
  level?: string;
  message: string;
}

export interface EnvVarMetadata {
  key: string;
  isSecret: boolean;
  valueHint?: string;
  syncedFrom?: string;
  lastUpdatedAt?: string;
}

export interface RuntimeSummary {
  service: Service;
  latestDeploy?: Deploy;
  health: {
    status: string;
    signal: string[];
  };
  scaling?: {
    instances?: number;
    minInstances?: number;
    maxInstances?: number;
  };
}

export interface IncidentContext {
  serviceId: string;
  recentFailedDeploys: Deploy[];
  recentLogs: LogLine[];
  healthStatus: string;
  suspectedCauses: string[];
}

export interface TaskRunResult {
  id: string;
  status: string;
  startedAt?: string;
  finishedAt?: string;
}
