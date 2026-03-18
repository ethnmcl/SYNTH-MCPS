import { z } from 'zod';
import type { GithubTool } from '../../types/tool.js';
import { result } from '../../utils/result.js';
import { runGraphql } from '../../github/graphql.js';

const schema = z.object({ project_id: z.string().min(1) });

interface GetProjectQuery {
  node:
    | {
        id: string;
        title: string;
        shortDescription: string | null;
        url: string;
        closed: boolean;
      }
    | null;
}

export const getProjectTool: GithubTool<typeof schema> = {
  name: 'github_get_project',
  description: 'Get Project v2 details by node ID (GraphQL).',
  inputSchema: schema,
  execute: async (_ctx, input) => {
    const data = await runGraphql<GetProjectQuery>(
      _ctx.octokit,
      `query($projectId: ID!) {
        node(id: $projectId) {
          ... on ProjectV2 {
            id
            title
            shortDescription
            url
            closed
          }
        }
      }`,
      { projectId: input.project_id }
    );

    return result(`Project ${input.project_id} loaded`, {
      project: data.node
    });
  }
};
