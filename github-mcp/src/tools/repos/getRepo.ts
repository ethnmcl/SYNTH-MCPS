import { ownerRepoSchema } from '../../schemas/common.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema;

export const getRepoTool: GithubTool<typeof schema> = {
  name: 'github_get_repo',
  description: 'Get repository metadata.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.repos.get(input);
    return result(`Repository ${data.full_name} loaded`, {
      id: data.id,
      full_name: data.full_name,
      private: data.private,
      default_branch: data.default_branch,
      html_url: data.html_url,
      description: data.description,
      language: data.language,
      stargazers_count: data.stargazers_count,
      forks_count: data.forks_count,
      open_issues_count: data.open_issues_count
    });
  }
};
