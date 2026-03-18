import { z } from 'zod';
import type { GithubTool } from '../../types/tool.js';
import { result } from '../../utils/result.js';

const schema = z.object({ username: z.string().optional() });

export const getUserTool: GithubTool<typeof schema> = {
  name: 'github_get_user',
  description: 'Get authenticated user or a specific user profile.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    const data = input.username
      ? (await ctx.octokit.rest.users.getByUsername({ username: input.username })).data
      : (await ctx.octokit.rest.users.getAuthenticated()).data;

    return result(`User ${data.login} loaded`, {
      login: data.login,
      id: data.id,
      name: data.name,
      company: data.company,
      blog: data.blog,
      location: data.location,
      public_repos: data.public_repos,
      followers: data.followers,
      html_url: data.html_url
    });
  }
};
