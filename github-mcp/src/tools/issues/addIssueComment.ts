import { z } from 'zod';
import { ownerRepoSchema } from '../../schemas/common.js';
import { issueNumberSchema } from '../../schemas/github.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo, guardWrite } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({
  issue_number: issueNumberSchema,
  body: z.string().min(1)
});

export const addIssueCommentTool: GithubTool<typeof schema> = {
  name: 'github_add_issue_comment',
  description: 'Add an issue comment.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardWrite(ctx);
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.issues.createComment(input);
    return result(`Added comment to issue #${input.issue_number}`, {
      id: data.id,
      html_url: data.html_url,
      created_at: data.created_at,
      user: data.user?.login
    });
  }
};
