import { z } from 'zod';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo } from '../common.js';
import { result } from '../../utils/result.js';

const schema = z.object({ org: z.string().min(1) });

export const getOrgTool: GithubTool<typeof schema> = {
  name: 'github_get_org',
  description: 'Get organization profile.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardRepo(ctx, input.org);
    const { data } = await ctx.octokit.rest.orgs.get(input);
    return result(`Organization ${data.login} loaded`, {
      login: data.login,
      id: data.id,
      name: data.name,
      description: data.description,
      location: data.location,
      public_repos: data.public_repos,
      html_url: data.html_url
    });
  }
};
