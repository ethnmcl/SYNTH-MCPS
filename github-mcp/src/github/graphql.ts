import type { Octokit } from '@octokit/rest';

export const runGraphql = async <T>(octokit: Octokit, query: string, variables: Record<string, unknown>) => {
  return (await octokit.graphql(query, variables)) as T;
};
