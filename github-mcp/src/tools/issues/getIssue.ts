import { ownerRepoSchema } from '../../schemas/common.js';
import { issueNumberSchema } from '../../schemas/github.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({ issue_number: issueNumberSchema });

export const getIssueTool: GithubTool<typeof schema> = {
  name: 'github_get_issue',
  description: 'Get issue details.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.issues.get(input);
    return result(`Issue #${data.number} loaded`, {
      number: data.number,
      title: data.title,
      state: data.state,
      body: data.body,
      user: data.user?.login,
      assignees: data.assignees?.map((a) => a.login) ?? [],
      labels: data.labels.map((l) => (typeof l === 'string' ? l : l.name)),
      milestone: data.milestone?.title,
      html_url: data.html_url
    });
  }
};
