import { z } from 'zod';
import { ownerRepoSchema } from '../../schemas/common.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({
  ref: z.string().min(1)
});

export const getCommitTool: GithubTool<typeof schema> = {
  name: 'github_get_commit',
  description: 'Get commit details by SHA or ref.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.repos.getCommit({
      owner: input.owner,
      repo: input.repo,
      ref: input.ref
    });

    return result(`Commit ${data.sha} loaded`, {
      sha: data.sha,
      html_url: data.html_url,
      message: data.commit.message,
      author: data.commit.author,
      committer: data.commit.committer,
      stats: data.stats,
      file_count: data.files?.length ?? 0,
      parents: data.parents.map((parent) => parent.sha)
    });
  }
};
