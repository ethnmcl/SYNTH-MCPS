import { z } from 'zod';
import { ownerRepoSchema } from '../../schemas/common.js';
import { pullNumberSchema } from '../../schemas/github.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo, guardWrite } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({
  pull_number: pullNumberSchema,
  body: z.string().min(1),
  commit_id: z.string().min(1),
  path: z.string().min(1),
  line: z.number().int().positive(),
  side: z.enum(['LEFT', 'RIGHT']).optional()
});

export const submitPullRequestReviewCommentTool: GithubTool<typeof schema> = {
  name: 'github_submit_pull_request_review_comment',
  description: 'Create a pull request line-level review comment.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardWrite(ctx);
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.pulls.createReviewComment(input);
    return result(`Created review comment on PR #${input.pull_number}`, {
      id: data.id,
      path: data.path,
      line: data.line,
      side: data.side,
      html_url: data.html_url
    });
  }
};
