import { z } from 'zod';
import type { GithubTool } from '../../types/tool.js';
import { result } from '../../utils/result.js';
import { runGraphql } from '../../github/graphql.js';

const schema = z.object({
  owner: z.string().min(1),
  first: z.number().int().min(1).max(100).default(20)
});

interface ListProjectsQuery {
  user: { projectsV2: { nodes: Array<{ id: string; title: string; url: string; closed: boolean }> } } | null;
  organization: { projectsV2: { nodes: Array<{ id: string; title: string; url: string; closed: boolean }> } } | null;
}

export const listProjectsTool: GithubTool<typeof schema> = {
  name: 'github_list_projects',
  description: 'List Projects v2 for a user or organization (GraphQL).',
  inputSchema: schema,
  execute: async (ctx, input) => {
    const data = await runGraphql<ListProjectsQuery>(
      ctx.octokit,
      `query($owner: String!, $first: Int!) {
        user(login: $owner) {
          projectsV2(first: $first) { nodes { id title url closed } }
        }
        organization(login: $owner) {
          projectsV2(first: $first) { nodes { id title url closed } }
        }
      }`,
      input
    );

    const nodes = data.organization?.projectsV2.nodes ?? data.user?.projectsV2.nodes ?? [];
    return result(`Fetched ${nodes.length} projects`, {
      count: nodes.length,
      projects: nodes
    });
  }
};
