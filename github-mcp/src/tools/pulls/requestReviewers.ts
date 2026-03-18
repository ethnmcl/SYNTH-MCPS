import { z } from 'zod';
import { ownerRepoSchema } from '../../schemas/common.js';
import { pullNumberSchema } from '../../schemas/github.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo, guardWrite } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({
  pull_number: pullNumberSchema,
  reviewers: z.array(z.string()).optional(),
  team_reviewers: z.array(z.string()).optional()
});

export const requestReviewersTool: GithubTool<typeof schema> = {
  name: 'github_request_reviewers',
  description: 'Request reviewers on a pull request.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardWrite(ctx);
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.pulls.requestReviewers(input);
    return result(`Requested reviewers for PR #${input.pull_number}`, {
      number: data.number,
      requested_reviewers: data.requested_reviewers?.map((u) => u.login) ?? [],
      requested_teams: data.requested_teams?.map((t) => t.slug) ?? []
    });
  }
};
