import { z } from 'zod';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo } from '../common.js';
import { result } from '../../utils/result.js';
import { runGraphql } from '../../github/graphql.js';

const schema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  first: z.number().int().min(1).max(100).default(20)
});

interface DiscussionQuery {
  repository: {
    discussions: {
      nodes: Array<{
        id: string;
        number: number;
        title: string;
        url: string;
        createdAt: string;
        author: { login: string } | null;
        category: { name: string } | null;
      }>;
    };
  } | null;
}

export const listDiscussionsTool: GithubTool<typeof schema> = {
  name: 'github_list_discussions',
  description: 'List discussions in a repository (GraphQL).',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardRepo(ctx, input.owner, input.repo);
    const data = await runGraphql<DiscussionQuery>(
      ctx.octokit,
      `query($owner: String!, $repo: String!, $first: Int!) {
        repository(owner: $owner, name: $repo) {
          discussions(first: $first) {
            nodes {
              id
              number
              title
              url
              createdAt
              author { login }
              category { name }
            }
          }
        }
      }`,
      input
    );

    const nodes = data.repository?.discussions.nodes ?? [];
    return result(`Fetched ${nodes.length} discussions`, {
      count: nodes.length,
      discussions: nodes.map((d) => ({
        id: d.id,
        number: d.number,
        title: d.title,
        url: d.url,
        created_at: d.createdAt,
        author: d.author?.login,
        category: d.category?.name
      }))
    });
  }
};
