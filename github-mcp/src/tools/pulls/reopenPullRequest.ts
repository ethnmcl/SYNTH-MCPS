import { ownerRepoSchema } from '../../schemas/common.js';
import { pullNumberSchema } from '../../schemas/github.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo, guardWrite } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({ pull_number: pullNumberSchema });

export const reopenPullRequestTool: GithubTool<typeof schema> = {
  name: 'github_reopen_pull_request',
  description: 'Reopen a pull request.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardWrite(ctx);
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.pulls.update({ ...input, state: 'open' });
    return result(`Reopened pull request #${data.number}`, {
      number: data.number,
      state: data.state,
      html_url: data.html_url
    });
  }
};
