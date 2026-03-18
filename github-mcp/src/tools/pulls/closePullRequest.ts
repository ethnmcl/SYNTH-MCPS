import { ownerRepoSchema } from '../../schemas/common.js';
import { pullNumberSchema } from '../../schemas/github.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo, guardWrite } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({ pull_number: pullNumberSchema });

export const closePullRequestTool: GithubTool<typeof schema> = {
  name: 'github_close_pull_request',
  description: 'Close a pull request without merging.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardWrite(ctx);
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.pulls.update({ ...input, state: 'closed' });
    return result(`Closed pull request #${data.number}`, {
      number: data.number,
      state: data.state,
      html_url: data.html_url
    });
  }
};
