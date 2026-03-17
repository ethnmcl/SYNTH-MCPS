import type { RenderClient } from "../client.js";
import { UnsupportedOperationError } from "../../lib/errors.js";

export interface MetricsSummary {
  cpuPct?: number;
  memoryMb?: number;
  requestRate?: number;
  errorRatePct?: number;
}

export class MetricsEndpoint {
  public constructor(private readonly client: RenderClient) {}

  public async getServiceMetricsSummary(serviceId: string): Promise<MetricsSummary> {
    try {
      const raw = await this.client.get<Record<string, unknown>>(`/services/${serviceId}/metrics/summary`);
      return {
        cpuPct: typeof raw.cpuPct === "number" ? raw.cpuPct : undefined,
        memoryMb: typeof raw.memoryMb === "number" ? raw.memoryMb : undefined,
        requestRate: typeof raw.requestRate === "number" ? raw.requestRate : undefined,
        errorRatePct: typeof raw.errorRatePct === "number" ? raw.errorRatePct : undefined
      };
    } catch {
      throw new UnsupportedOperationError(
        "Metrics summary endpoint is provider-dependent and not available in this environment"
      );
    }
  }
}
