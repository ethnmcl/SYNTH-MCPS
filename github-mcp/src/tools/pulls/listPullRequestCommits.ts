import { z } from 'zod';
import { ownerRepoSchema } from '../../schemas/common.js';
import { pullNumberSchema } from '../../schemas/github.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({
  pull_number: pullNumberSchema,
  per_page: z.number().int().min(1).max(100).default(100),
  page: z.number().int().min(1).default(1)
});

export const listPullRequestCommitsTool: GithubTool<typeof schema> = {
  name: 'github_list_pull_request_commits',
  description: 'List commits in a pull request.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.pulls.listCommits(input);
    return result(`Fetched ${data.length} commits for PR #${input.pull_number}`, {
      count: data.length,
      commits: data.map((c) => ({
        sha: c.sha,
        message: c.commit.message,
        author: c.commit.author,
        html_url: c.html_url
      }))
    });
  }
};
