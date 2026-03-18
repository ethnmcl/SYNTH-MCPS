import { ownerRepoSchema } from '../../schemas/common.js';
import { pullNumberSchema } from '../../schemas/github.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo } from '../common.js';
import { result } from '../../utils/result.js';
import { truncate } from '../../utils/text.js';

const schema = ownerRepoSchema.extend({ pull_number: pullNumberSchema, max_chars: pullNumberSchema.max(200_000).default(50_000) });

export const getPullRequestDiffTool: GithubTool<typeof schema> = {
  name: 'github_get_pull_request_diff',
  description: 'Get raw pull request diff text.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardRepo(ctx, input.owner, input.repo);
    const response = await ctx.octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
      owner: input.owner,
      repo: input.repo,
      pull_number: input.pull_number,
      headers: {
        accept: 'application/vnd.github.v3.diff'
      }
    });

    const diff = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    return result(`Diff for PR #${input.pull_number}`, {
      pull_number: input.pull_number,
      diff: truncate(diff, input.max_chars),
      truncated: diff.length > input.max_chars
    });
  }
};
