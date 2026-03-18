import { z } from 'zod';
import { ownerRepoSchema } from '../../schemas/common.js';
import { issueNumberSchema } from '../../schemas/github.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({
  issue_number: issueNumberSchema,
  per_page: z.number().int().min(1).max(100).default(30),
  page: z.number().int().min(1).default(1)
});

export const listIssueCommentsTool: GithubTool<typeof schema> = {
  name: 'github_list_issue_comments',
  description: 'List issue comments.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.issues.listComments(input);
    return result(`Fetched ${data.length} comments`, {
      count: data.length,
      comments: data.map((c) => ({
        id: c.id,
        user: c.user?.login,
        created_at: c.created_at,
        html_url: c.html_url,
        body: c.body
      }))
    });
  }
};
