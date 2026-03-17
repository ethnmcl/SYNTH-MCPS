import type { RenderClient } from "../client.js";
import { mapLogLine } from "../mappers.js";
import type { LogLine } from "../models.js";
import { extractList } from "./listShape.js";

export class LogsEndpoint {
  public constructor(private readonly client: RenderClient) {}

  public async getRecentLogs(serviceId: string, limit = 200, startTime?: string): Promise<LogLine[]> {
    const response = await this.client.get<unknown>(`/services/${serviceId}/logs`, {
      query: {
        limit,
        startTime
      }
    });
    return extractList(response, ["logs"]).map(mapLogLine);
  }
}
