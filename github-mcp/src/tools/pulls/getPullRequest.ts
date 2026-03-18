import { ownerRepoSchema } from '../../schemas/common.js';
import { pullNumberSchema } from '../../schemas/github.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({ pull_number: pullNumberSchema });

export const getPullRequestTool: GithubTool<typeof schema> = {
  name: 'github_get_pull_request',
  description: 'Get pull request details.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.pulls.get(input);
    return result(`Pull request #${data.number} loaded`, {
      number: data.number,
      title: data.title,
      state: data.state,
      merged: data.merged,
      draft: data.draft,
      base: data.base.ref,
      head: data.head.ref,
      user: data.user?.login,
      html_url: data.html_url
    });
  }
};
