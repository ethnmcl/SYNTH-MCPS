import { z } from 'zod';
import { ownerRepoSchema } from '../../schemas/common.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo, guardWrite } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({
  tag_name: z.string().min(1),
  target_commitish: z.string().optional(),
  name: z.string().optional(),
  body: z.string().optional(),
  draft: z.boolean().optional(),
  prerelease: z.boolean().optional(),
  generate_release_notes: z.boolean().optional()
});

export const createReleaseTool: GithubTool<typeof schema> = {
  name: 'github_create_release',
  description: 'Create a release.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardWrite(ctx);
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.repos.createRelease(input);
    return result(`Created release ${data.tag_name}`, {
      id: data.id,
      tag_name: data.tag_name,
      name: data.name,
      draft: data.draft,
      prerelease: data.prerelease,
      html_url: data.html_url
    });
  }
};
