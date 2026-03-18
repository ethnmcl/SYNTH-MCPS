import { z } from 'zod';
import { ownerRepoSchema } from '../../schemas/common.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({
  release_id: z.number().int().positive().optional(),
  tag_name: z.string().optional()
});

export const getReleaseTool: GithubTool<typeof schema> = {
  name: 'github_get_release',
  description: 'Get a release by ID or tag.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardRepo(ctx, input.owner, input.repo);
    const data = input.release_id
      ? (await ctx.octokit.rest.repos.getRelease({
          owner: input.owner,
          repo: input.repo,
          release_id: input.release_id
        })).data
      : (await ctx.octokit.rest.repos.getReleaseByTag({
          owner: input.owner,
          repo: input.repo,
          tag: input.tag_name ?? 'latest'
        })).data;

    return result(`Release ${data.tag_name} loaded`, {
      id: data.id,
      tag_name: data.tag_name,
      name: data.name,
      body: data.body,
      draft: data.draft,
      prerelease: data.prerelease,
      published_at: data.published_at,
      html_url: data.html_url
    });
  }
};
