import { z } from 'zod';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo } from '../common.js';
import { result } from '../../utils/result.js';

const schema = z.object({
  org: z.string().min(1),
  filter: z.enum(['all', '2fa_disabled']).default('all'),
  role: z.enum(['all', 'admin', 'member']).default('all'),
  per_page: z.number().int().min(1).max(100).default(30),
  page: z.number().int().min(1).default(1)
});

export const listOrgMembersTool: GithubTool<typeof schema> = {
  name: 'github_list_org_members',
  description: 'List organization members.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardRepo(ctx, input.org);
    const { data } = await ctx.octokit.rest.orgs.listMembers(input);
    return result(`Fetched ${data.length} org members`, {
      count: data.length,
      members: data.map((m) => ({
        login: m.login,
        id: m.id,
        type: m.type,
        html_url: m.html_url
      }))
    });
  }
};
