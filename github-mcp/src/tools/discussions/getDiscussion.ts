import { z } from 'zod';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo } from '../common.js';
import { result } from '../../utils/result.js';
import { runGraphql } from '../../github/graphql.js';

const schema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  number: z.number().int().positive()
});

interface DiscussionDetailQuery {
  repository: {
    discussion: {
      id: string;
      number: number;
      title: string;
      body: string;
      url: string;
      createdAt: string;
      author: { login: string } | null;
      category: { id: string; name: string } | null;
    } | null;
  } | null;
}

export const getDiscussionTool: GithubTool<typeof schema> = {
  name: 'github_get_discussion',
  description: 'Get a repository discussion by number (GraphQL).',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardRepo(ctx, input.owner, input.repo);
    const data = await runGraphql<DiscussionDetailQuery>(
      ctx.octokit,
      `query($owner: String!, $repo: String!, $number: Int!) {
        repository(owner: $owner, name: $repo) {
          discussion(number: $number) {
            id
            number
            title
            body
            url
            createdAt
            author { login }
            category { id name }
          }
        }
      }`,
      input
    );

    return result(`Discussion #${input.number} loaded`, {
      discussion: data.repository?.discussion ?? null
    });
  }
};
