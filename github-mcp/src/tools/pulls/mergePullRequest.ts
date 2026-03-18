import { z } from 'zod';
import { ownerRepoSchema } from '../../schemas/common.js';
import { pullNumberSchema } from '../../schemas/github.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo, guardWrite } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({
  pull_number: pullNumberSchema,
  commit_title: z.string().optional(),
  commit_message: z.string().optional(),
  merge_method: z.enum(['merge', 'squash', 'rebase']).default('merge'),
  sha: z.string().optional()
});

export const mergePullRequestTool: GithubTool<typeof schema> = {
  name: 'github_merge_pull_request',
  description: 'Merge a pull request.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardWrite(ctx);
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.pulls.merge(input);
    return result(`Merge operation for PR #${input.pull_number}: ${data.message}`, {
      merged: data.merged,
      message: data.message,
      sha: data.sha
    });
  }
};
