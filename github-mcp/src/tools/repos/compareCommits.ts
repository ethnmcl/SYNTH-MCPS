import { z } from 'zod';
import { ownerRepoSchema } from '../../schemas/common.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({
  base: z.string().min(1),
  head: z.string().min(1)
});

export const compareCommitsTool: GithubTool<typeof schema> = {
  name: 'github_compare_commits',
  description: 'Compare two commits, tags, or branches.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.repos.compareCommits({
      owner: input.owner,
      repo: input.repo,
      base: input.base,
      head: input.head
    });

    return result(`Compared ${input.base}...${input.head}`, {
      status: data.status,
      ahead_by: data.ahead_by,
      behind_by: data.behind_by,
      total_commits: data.total_commits,
      files_changed: data.files?.length ?? 0,
      commits: data.commits.map((c) => ({
        sha: c.sha,
        message: c.commit.message,
        author: c.commit.author
      }))
    });
  }
};
