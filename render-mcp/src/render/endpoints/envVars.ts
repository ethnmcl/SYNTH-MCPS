import type { RenderClient } from "../client.js";
import { mapEnvVarMetadata } from "../mappers.js";
import type { EnvVarMetadata } from "../models.js";
import { extractList } from "./listShape.js";

export interface EnvVarUpdate {
  key: string;
  value: string;
  isSecret?: boolean;
}

export class EnvVarsEndpoint {
  public constructor(private readonly client: RenderClient) {}

  public async listMetadata(serviceId: string): Promise<EnvVarMetadata[]> {
    const response = await this.client.get<unknown>(`/services/${serviceId}/env-vars`);
    return extractList(response, ["envVars", "env_vars"]).map(mapEnvVarMetadata);
  }

  public async updateOne(serviceId: string, input: EnvVarUpdate): Promise<Record<string, unknown>> {
    return this.client.patch(`/services/${serviceId}/env-vars`, {
      body: {
        envVars: [
          {
            key: input.key,
            value: input.value,
            secret: input.isSecret ?? true
          }
        ]
      }
    });
  }

  public async bulkUpdate(serviceId: string, updates: EnvVarUpdate[]): Promise<Record<string, unknown>> {
    return this.client.patch(`/services/${serviceId}/env-vars`, {
      body: {
        envVars: updates.map((item) => ({
          key: item.key,
          value: item.value,
          secret: item.isSecret ?? true
        }))
      }
    });
  }
}
