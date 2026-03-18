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

export const listPullRequestFilesTool: GithubTool<typeof schema> = {
  name: 'github_list_pull_request_files',
  description: 'List files changed in a pull request.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.pulls.listFiles(input);
    return result(`Fetched ${data.length} files for PR #${input.pull_number}`, {
      count: data.length,
      files: data.map((f) => ({
        filename: f.filename,
        status: f.status,
        additions: f.additions,
        deletions: f.deletions,
        changes: f.changes,
        blob_url: f.blob_url
      }))
    });
  }
};
