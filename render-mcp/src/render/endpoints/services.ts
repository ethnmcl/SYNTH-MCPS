import type { RenderClient } from "../client.js";
import { mapService } from "../mappers.js";
import type { Service } from "../models.js";
import { extractList, isLimitTooLargeError } from "./listShape.js";

export class ServicesEndpoint {
  public constructor(private readonly client: RenderClient) {}

  public async listServices(limit = 100): Promise<Service[]> {
    let response: unknown;
    try {
      response = await this.client.get<unknown>("/services", {
        query: { limit }
      });
    } catch (error) {
      if (!isLimitTooLargeError(error)) {
        throw error;
      }
      response = await this.client.get<unknown>("/services", {
        query: { limit: 20 }
      });
    }
    const services = extractList(response, ["services"]);
    return services.map(mapService);
  }

  public async getService(serviceId: string): Promise<Service> {
    const raw = await this.client.get<Record<string, unknown>>(`/services/${serviceId}`);
    return mapService(raw);
  }

  public async restartService(serviceId: string): Promise<Record<string, unknown>> {
    return this.client.post(`/services/${serviceId}/restart`);
  }

  public async scaleService(
    serviceId: string,
    payload: { numInstances?: number; minInstances?: number; maxInstances?: number }
  ): Promise<Record<string, unknown>> {
    return this.client.patch(`/services/${serviceId}/scale`, { body: payload });
  }

  public async setSuspendState(serviceId: string, suspended: boolean): Promise<Record<string, unknown>> {
    return this.client.patch(`/services/${serviceId}`, { body: { suspended } });
  }

  public async clearBuildCache(serviceId: string): Promise<Record<string, unknown>> {
    return this.client.post(`/services/${serviceId}/clear-build-cache`);
  }
}
