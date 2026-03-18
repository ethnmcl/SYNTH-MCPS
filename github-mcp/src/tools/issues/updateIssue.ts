import { z } from 'zod';
import { ownerRepoSchema } from '../../schemas/common.js';
import { issueNumberSchema } from '../../schemas/github.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo, guardWrite } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({
  issue_number: issueNumberSchema,
  title: z.string().optional(),
  body: z.string().optional(),
  assignees: z.array(z.string()).optional(),
  labels: z.array(z.string()).optional(),
  milestone: z.number().int().nonnegative().optional(),
  state: z.enum(['open', 'closed']).optional()
});

export const updateIssueTool: GithubTool<typeof schema> = {
  name: 'github_update_issue',
  description: 'Update issue fields.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardWrite(ctx);
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.issues.update(input);
    return result(`Updated issue #${data.number}`, {
      number: data.number,
      title: data.title,
      state: data.state,
      html_url: data.html_url
    });
  }
};
