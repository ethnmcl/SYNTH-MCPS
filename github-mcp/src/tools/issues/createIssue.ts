import { z } from 'zod';
import { ownerRepoSchema } from '../../schemas/common.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo, guardWrite } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({
  title: z.string().min(1),
  body: z.string().optional(),
  assignees: z.array(z.string()).optional(),
  labels: z.array(z.string()).optional(),
  milestone: z.number().int().positive().optional()
});

export const createIssueTool: GithubTool<typeof schema> = {
  name: 'github_create_issue',
  description: 'Create a new issue.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardWrite(ctx);
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.issues.create(input);
    return result(`Created issue #${data.number}`, {
      number: data.number,
      title: data.title,
      state: data.state,
      html_url: data.html_url,
      id: data.id
    });
  }
};
