import { z } from 'zod';
import type { GithubTool } from '../../types/tool.js';
import { AppError } from '../../utils/errors.js';
import { guardRepo, guardWrite } from '../common.js';
import { result } from '../../utils/result.js';
import { runGraphql } from '../../github/graphql.js';

const schema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  category_id: z.string().min(1)
});

interface RepoIdQuery {
  repository: { id: string } | null;
}

interface CreateDiscussionMutation {
  createDiscussion: {
    discussion: {
      id: string;
      number: number;
      title: string;
      url: string;
    };
  };
}

export const createDiscussionTool: GithubTool<typeof schema> = {
  name: 'github_create_discussion',
  description: 'Create a repository discussion (GraphQL).',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardWrite(ctx);
    guardRepo(ctx, input.owner, input.repo);

    const repoData = await runGraphql<RepoIdQuery>(
      ctx.octokit,
      `query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) { id }
      }`,
      input
    );

    const repositoryId = repoData.repository?.id;
    if (!repositoryId) {
      throw new AppError('Repository not found for discussion creation', 404);
    }

    const data = await runGraphql<CreateDiscussionMutation>(
      ctx.octokit,
      `mutation($repositoryId: ID!, $categoryId: ID!, $title: String!, $body: String!) {
        createDiscussion(input: {
          repositoryId: $repositoryId,
          categoryId: $categoryId,
          title: $title,
          body: $body
        }) {
          discussion {
            id
            number
            title
            url
          }
        }
      }`,
      {
        repositoryId,
        categoryId: input.category_id,
        title: input.title,
        body: input.body
      }
    );

    return result(`Created discussion '${data.createDiscussion.discussion.title}'`, {
      discussion: data.createDiscussion.discussion
    });
  }
};
