import { ownerRepoSchema } from '../../schemas/common.js';
import { issueNumberSchema } from '../../schemas/github.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo, guardWrite } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({ issue_number: issueNumberSchema });

export const reopenIssueTool: GithubTool<typeof schema> = {
  name: 'github_reopen_issue',
  description: 'Reopen an issue.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardWrite(ctx);
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.issues.update({ ...input, state: 'open' });
    return result(`Reopened issue #${data.number}`, { number: data.number, state: data.state, html_url: data.html_url });
  }
};
