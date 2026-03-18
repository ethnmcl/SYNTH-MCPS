import { z } from 'zod';
import { ownerRepoSchema } from '../../schemas/common.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo, guardWrite } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({
  release_id: z.number().int().positive(),
  tag_name: z.string().optional(),
  target_commitish: z.string().optional(),
  name: z.string().optional(),
  body: z.string().optional(),
  draft: z.boolean().optional(),
  prerelease: z.boolean().optional(),
  make_latest: z.enum(['true', 'false', 'legacy']).optional()
});

export const updateReleaseTool: GithubTool<typeof schema> = {
  name: 'github_update_release',
  description: 'Update an existing release.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardWrite(ctx);
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.repos.updateRelease(input);
    return result(`Updated release ${data.tag_name}`, {
      id: data.id,
      tag_name: data.tag_name,
      name: data.name,
      draft: data.draft,
      prerelease: data.prerelease,
      html_url: data.html_url
    });
  }
};
