import { z } from 'zod';
import { ownerRepoSchema } from '../../schemas/common.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({
  per_page: z.number().int().min(1).max(100).default(30),
  page: z.number().int().min(1).default(1)
});

export const listReleasesTool: GithubTool<typeof schema> = {
  name: 'github_list_releases',
  description: 'List repository releases.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.repos.listReleases(input);
    return result(`Fetched ${data.length} releases`, {
      count: data.length,
      releases: data.map((r) => ({
        id: r.id,
        tag_name: r.tag_name,
        name: r.name,
        draft: r.draft,
        prerelease: r.prerelease,
        published_at: r.published_at,
        html_url: r.html_url
      }))
    });
  }
};
