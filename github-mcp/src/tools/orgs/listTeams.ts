import { z } from 'zod';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo } from '../common.js';
import { result } from '../../utils/result.js';

const schema = z.object({
  org: z.string().min(1),
  per_page: z.number().int().min(1).max(100).default(30),
  page: z.number().int().min(1).default(1)
});

export const listTeamsTool: GithubTool<typeof schema> = {
  name: 'github_list_teams',
  description: 'List teams in an organization.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardRepo(ctx, input.org);
    const { data } = await ctx.octokit.rest.teams.list(input);
    return result(`Fetched ${data.length} teams`, {
      count: data.length,
      teams: data.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        privacy: t.privacy,
        permission: t.permission,
        html_url: t.html_url
      }))
    });
  }
};
