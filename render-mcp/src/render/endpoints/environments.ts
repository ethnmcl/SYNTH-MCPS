import type { RenderClient } from "../client.js";
import { mapEnvironment } from "../mappers.js";
import type { Environment } from "../models.js";
import { extractList, isLimitTooLargeError } from "./listShape.js";

export class EnvironmentsEndpoint {
  public constructor(private readonly client: RenderClient) {}

  public async listEnvironments(limit = 100): Promise<Environment[]> {
    let response: unknown;
    try {
      response = await this.client.get<unknown>("/environments", {
        query: { limit }
      });
    } catch (error) {
      if (!isLimitTooLargeError(error)) {
        throw error;
      }
      response = await this.client.get<unknown>("/environments", {
        query: { limit: 20 }
      });
    }
    return extractList(response, ["environments"]).map(mapEnvironment);
  }
}
