import { z } from 'zod';
import { ownerRepoSchema } from '../../schemas/common.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({
  per_page: z.number().int().min(1).max(100).default(30),
  page: z.number().int().min(1).default(1)
});

export const listRepoTagsTool: GithubTool<typeof schema> = {
  name: 'github_list_repo_tags',
  description: 'List tags in a repository.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.repos.listTags(input);

    return result(`Fetched ${data.length} tags`, {
      count: data.length,
      tags: data.map((tag) => ({
        name: tag.name,
        sha: tag.commit.sha,
        tarball_url: tag.tarball_url,
        zipball_url: tag.zipball_url
      }))
    });
  }
};
