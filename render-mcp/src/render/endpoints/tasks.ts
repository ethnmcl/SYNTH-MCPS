import type { RenderClient } from "../client.js";
import { UnsupportedOperationError } from "../../lib/errors.js";
import { mapTaskRunResult } from "../mappers.js";
import type { TaskRunResult } from "../models.js";

export class TasksEndpoint {
  public constructor(private readonly client: RenderClient) {}

  public async runTask(serviceId: string, taskName: string): Promise<TaskRunResult> {
    try {
      const raw = await this.client.post<Record<string, unknown>>(`/services/${serviceId}/tasks/${taskName}/run`);
      return mapTaskRunResult(raw);
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        throw new UnsupportedOperationError(
          "Task execution endpoint is unavailable for this service or Render plan"
        );
      }
      throw error;
    }
  }
}
