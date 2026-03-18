import { z } from 'zod';
import { ownerRepoSchema } from '../../schemas/common.js';
import { pullNumberSchema } from '../../schemas/github.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo, guardWrite } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({
  pull_number: pullNumberSchema,
  title: z.string().optional(),
  body: z.string().optional(),
  state: z.enum(['open', 'closed']).optional(),
  base: z.string().optional(),
  maintainer_can_modify: z.boolean().optional()
});

export const updatePullRequestTool: GithubTool<typeof schema> = {
  name: 'github_update_pull_request',
  description: 'Update pull request metadata.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardWrite(ctx);
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.pulls.update(input);
    return result(`Updated pull request #${data.number}`, {
      number: data.number,
      title: data.title,
      state: data.state,
      html_url: data.html_url
    });
  }
};
