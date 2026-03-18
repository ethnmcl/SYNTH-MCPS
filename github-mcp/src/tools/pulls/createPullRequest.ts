import { z } from 'zod';
import { ownerRepoSchema } from '../../schemas/common.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo, guardWrite } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({
  title: z.string().min(1),
  head: z.string().min(1),
  base: z.string().min(1),
  body: z.string().optional(),
  draft: z.boolean().optional(),
  maintainer_can_modify: z.boolean().optional()
});

export const createPullRequestTool: GithubTool<typeof schema> = {
  name: 'github_create_pull_request',
  description: 'Create a pull request.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardWrite(ctx);
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.pulls.create(input);
    return result(`Created pull request #${data.number}`, {
      id: data.id,
      number: data.number,
      title: data.title,
      state: data.state,
      html_url: data.html_url
    });
  }
};
