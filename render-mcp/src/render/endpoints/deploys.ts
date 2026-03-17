import type { RenderClient } from "../client.js";
import { mapDeploy } from "../mappers.js";
import type { Deploy } from "../models.js";
import { extractList } from "./listShape.js";

export class DeploysEndpoint {
  public constructor(private readonly client: RenderClient) {}

  public async listDeploys(serviceId: string, limit = 20): Promise<Deploy[]> {
    const response = await this.client.get<unknown>(`/services/${serviceId}/deploys`, {
      query: { limit }
    });
    return extractList(response, ["deploys"]).map((d) => mapDeploy(d, serviceId));
  }

  public async getLatestDeploy(serviceId: string): Promise<Deploy | undefined> {
    const deploys = await this.listDeploys(serviceId, 1);
    return deploys[0];
  }

  public async getDeploy(serviceId: string, deployId: string): Promise<Deploy> {
    const raw = await this.client.get<Record<string, unknown>>(`/services/${serviceId}/deploys/${deployId}`);
    return mapDeploy(raw, serviceId);
  }

  public async triggerDeploy(serviceId: string, clearCache?: boolean): Promise<Deploy> {
    const raw = await this.client.post<Record<string, unknown>>(`/services/${serviceId}/deploys`, {
      body: { clearCache: Boolean(clearCache) }
    });
    return mapDeploy(raw, serviceId);
  }
}
