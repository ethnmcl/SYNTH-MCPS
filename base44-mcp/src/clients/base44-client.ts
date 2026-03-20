import { AppError } from '../core/errors.js';
import type { Env } from '../config/env.js';

interface MockStore {
  projects: Array<Record<string, unknown>>;
  entities: Array<Record<string, unknown>>;
  functions: Array<Record<string, unknown>>;
  integrations: Array<Record<string, unknown>>;
  connectors: Array<Record<string, unknown>>;
  skills: Array<Record<string, unknown>>;
  deployments: Array<Record<string, unknown>>;
}

const now = () => new Date().toISOString();

const mockStore: MockStore = {
  projects: [{ id: 'proj_001', name: 'Base44 Demo', workspaceId: 'ws_001', createdAt: now() }],
  entities: [{ id: 'ent_001', projectId: 'proj_001', name: 'Customer', schema: { fields: { email: 'string' } } }],
  functions: [{ id: 'fn_001', projectId: 'proj_001', name: 'calculateRisk', runtime: 'node' }],
  integrations: [{ id: 'int_001', workspaceId: 'ws_001', name: 'Stripe', source: 'openapi' }],
  connectors: [{ id: 'con_001', workspaceId: 'ws_001', type: 'slack', status: 'connected' }],
  skills: [{ id: 'skill_001', projectId: 'proj_001', name: 'onboarding-helper' }],
  deployments: [{ id: 'dep_001', projectId: 'proj_001', status: 'success', createdAt: now() }]
};

const asRecord = (value: unknown): Record<string, unknown> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
};

const pickList = (value: unknown, keys: string[]): Array<Record<string, unknown>> => {
  if (Array.isArray(value)) {
    return value.map(asRecord);
  }
  const record = asRecord(value);
  for (const key of keys) {
    const candidate = record[key];
    if (Array.isArray(candidate)) {
      return candidate.map(asRecord);
    }
  }
  return [];
};

export class Base44Client {
  constructor(private readonly env: Env) {}

  private get isMockMode(): boolean {
    return this.env.BASE44_MOCK_MODE;
  }

  private ensureMockOnly(): void {
    if (!this.isMockMode) {
      throw new AppError('This method is not wired to live Base44 APIs yet. Switch BASE44_MOCK_MODE=true.', 501);
    }
  }

  private requireAccessToken(): string {
    const token = this.env.BASE44_ACCESS_TOKEN.trim();
    if (!token) {
      throw new AppError('Missing BASE44_ACCESS_TOKEN for live Base44 API calls.', 401, {
        code: 'BASE44_ACCESS_TOKEN_MISSING'
      });
    }
    return token;
  }

  private buildUrl(path: string, query?: Record<string, string | undefined>): string {
    const base = this.env.BASE44_API_BASE_URL.replace(/\/$/, '');
    const full = new URL(`${base}${path.startsWith('/') ? path : `/${path}`}`);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v && v.trim().length > 0) {
          full.searchParams.set(k, v);
        }
      }
    }
    return full.toString();
  }

  private async request(path: string, init: RequestInit = {}, query?: Record<string, string | undefined>): Promise<unknown> {
    const token = this.requireAccessToken();
    const response = await fetch(this.buildUrl(path, query), {
      ...init,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(init.headers ?? {})
      }
    });

    const raw = await response.text();
    const payload = raw.length > 0 ? (() => {
      try {
        return JSON.parse(raw) as unknown;
      } catch {
        return { raw };
      }
    })() : {};

    if (!response.ok) {
      throw new AppError(`Base44 API request failed (${response.status})`, response.status, payload);
    }

    return payload;
  }

  async login(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    this.ensureMockOnly();
    return { authenticated: true, accessToken: 'mock_access_token', ...input };
  }

  async logout(): Promise<Record<string, unknown>> {
    this.ensureMockOnly();
    return { loggedOut: true, at: now() };
  }

  async whoami(): Promise<Record<string, unknown>> {
    if (this.isMockMode) {
      return { id: 'user_mock', email: 'builder@example.com', workspaceId: this.env.BASE44_WORKSPACE_ID || 'ws_001' };
    }

    const payload = await this.request('/me', { method: 'GET' });
    const record = asRecord(payload);
    const user = asRecord(record.user);

    return Object.keys(user).length > 0 ? user : record;
  }

  async listWorkspaces(): Promise<Record<string, unknown>> {
    if (this.isMockMode) {
      return { items: [{ id: 'ws_001', name: 'Default Workspace' }] };
    }

    const payload = await this.request('/workspaces', { method: 'GET' });
    const items = pickList(payload, ['items', 'workspaces', 'data']);
    return { items };
  }

  async createProject(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (this.isMockMode) {
      const item = { id: `proj_${Date.now()}`, createdAt: now(), ...input };
      mockStore.projects.push(item);
      return item;
    }

    const payload = await this.request('/projects', { method: 'POST', body: JSON.stringify(input) });
    const record = asRecord(payload);
    const project = asRecord(record.project);
    return Object.keys(project).length > 0 ? project : record;
  }

  async listProjects(input: { workspaceId?: string } = {}): Promise<Record<string, unknown>> {
    if (this.isMockMode) {
      return {
        items: mockStore.projects.filter((project) => !input.workspaceId || project.workspaceId === input.workspaceId)
      };
    }

    const payload = await this.request('/projects', { method: 'GET' }, { workspaceId: input.workspaceId });
    const items = pickList(payload, ['items', 'projects', 'data']);
    return { items };
  }

  async getProject(input: { projectId: string }): Promise<Record<string, unknown>> {
    this.ensureMockOnly();
    return mockStore.projects.find((x) => x.id === input.projectId) ?? { id: input.projectId, missing: true };
  }

  async updateProject(input: Record<string, unknown> & { projectId: string }): Promise<Record<string, unknown>> {
    this.ensureMockOnly();
    return { updated: true, ...input };
  }

  async deleteProject(input: { projectId: string }): Promise<Record<string, unknown>> {
    this.ensureMockOnly();
    return { deleted: true, ...input };
  }

  async cloneProject(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    this.ensureMockOnly();
    return { cloned: true, cloneId: `proj_${Date.now()}`, ...input };
  }

  async listEntities(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    this.ensureMockOnly();
    return { items: mockStore.entities.filter((x) => !input.projectId || x.projectId === input.projectId) };
  }

  async getEntity(input: { entityId: string }): Promise<Record<string, unknown>> {
    this.ensureMockOnly();
    return mockStore.entities.find((x) => x.id === input.entityId) ?? { id: input.entityId, missing: true };
  }

  async createEntity(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    this.ensureMockOnly();
    const item = { id: `ent_${Date.now()}`, ...input };
    mockStore.entities.push(item);
    return item;
  }

  async updateEntity(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    this.ensureMockOnly();
    return { updated: true, ...input };
  }

  async deleteEntity(input: { entityId: string }): Promise<Record<string, unknown>> {
    this.ensureMockOnly();
    return { deleted: true, ...input };
  }

  async listFunctions(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    this.ensureMockOnly();
    return { items: mockStore.functions.filter((x) => !input.projectId || x.projectId === input.projectId) };
  }

  async getFunction(input: { functionId: string }): Promise<Record<string, unknown>> {
    this.ensureMockOnly();
    return mockStore.functions.find((x) => x.id === input.functionId) ?? { id: input.functionId, missing: true };
  }

  async createFunction(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    this.ensureMockOnly();
    const item = { id: `fn_${Date.now()}`, ...input };
    mockStore.functions.push(item);
    return item;
  }

  async updateFunction(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    this.ensureMockOnly();
    return { updated: true, ...input };
  }

  async deleteFunction(input: { functionId: string }): Promise<Record<string, unknown>> {
    this.ensureMockOnly();
    return { deleted: true, ...input };
  }

  async listIntegrations(): Promise<Record<string, unknown>> {
    this.ensureMockOnly();
    return { items: mockStore.integrations };
  }

  async getIntegration(input: { integrationId: string }): Promise<Record<string, unknown>> {
    this.ensureMockOnly();
    return mockStore.integrations.find((x) => x.id === input.integrationId) ?? { id: input.integrationId, missing: true };
  }

  async createWorkspaceIntegrationFromOpenApi(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    this.ensureMockOnly();
    const item = { id: `int_${Date.now()}`, source: 'openapi', ...input };
    mockStore.integrations.push(item);
    return item;
  }

  async updateIntegration(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    this.ensureMockOnly();
    return { updated: true, ...input };
  }

  async deleteIntegration(input: { integrationId: string }): Promise<Record<string, unknown>> {
    this.ensureMockOnly();
    return { deleted: true, ...input };
  }

  async listConnectors(): Promise<Record<string, unknown>> {
    this.ensureMockOnly();
    return { items: mockStore.connectors };
  }

  async getConnector(input: { connectorId: string }): Promise<Record<string, unknown>> {
    this.ensureMockOnly();
    return mockStore.connectors.find((x) => x.id === input.connectorId) ?? { id: input.connectorId, missing: true };
  }

  async configureConnector(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    this.ensureMockOnly();
    return { configured: true, ...input };
  }

  async disconnectConnector(input: { connectorId: string }): Promise<Record<string, unknown>> {
    this.ensureMockOnly();
    return { disconnected: true, ...input };
  }

  async listSkills(): Promise<Record<string, unknown>> {
    this.ensureMockOnly();
    return { items: mockStore.skills };
  }

  async getSkill(input: { skillId: string }): Promise<Record<string, unknown>> {
    this.ensureMockOnly();
    return mockStore.skills.find((x) => x.id === input.skillId) ?? { id: input.skillId, missing: true };
  }

  async createSkill(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    this.ensureMockOnly();
    const item = { id: `skill_${Date.now()}`, ...input };
    mockStore.skills.push(item);
    return item;
  }

  async updateSkill(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    this.ensureMockOnly();
    return { updated: true, ...input };
  }

  async deleteSkill(input: { skillId: string }): Promise<Record<string, unknown>> {
    this.ensureMockOnly();
    return { deleted: true, ...input };
  }

  async deployProject(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    this.ensureMockOnly();
    const item = { id: `dep_${Date.now()}`, status: 'queued', ...input };
    mockStore.deployments.push(item);
    return item;
  }

  async checkDeployStatus(input: { deploymentId: string }): Promise<Record<string, unknown>> {
    this.ensureMockOnly();
    return mockStore.deployments.find((x) => x.id === input.deploymentId) ?? { id: input.deploymentId, status: 'unknown' };
  }
}
