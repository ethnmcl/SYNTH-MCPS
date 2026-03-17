import type { RenderClient } from "../client.js";
import { mapProject } from "../mappers.js";
import type { Project } from "../models.js";
import { extractList, isLimitTooLargeError } from "./listShape.js";

export class ProjectsEndpoint {
  public constructor(private readonly client: RenderClient) {}

  public async listProjects(limit = 100): Promise<Project[]> {
    let response: unknown;
    try {
      response = await this.client.get<unknown>("/projects", {
        query: { limit }
      });
    } catch (error) {
      if (!isLimitTooLargeError(error)) {
        throw error;
      }
      response = await this.client.get<unknown>("/projects", {
        query: { limit: 20 }
      });
    }
    return extractList(response, ["projects"]).map(mapProject);
  }

  public async getProject(projectId: string): Promise<Project> {
    const raw = await this.client.get<Record<string, unknown>>(`/projects/${projectId}`);
    return mapProject(raw);
  }
}
