import { z } from 'zod';
import { ownerRepoPathSchema } from '../../schemas/common.js';
import type { GithubTool } from '../../types/tool.js';
import { AppError } from '../../utils/errors.js';
import { guardRepo } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoPathSchema.extend({
  ref: z.string().optional()
});

export const getDirectoryContentsTool: GithubTool<typeof schema> = {
  name: 'github_get_directory_contents',
  description: 'List items in a repository directory path.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.repos.getContent({
      owner: input.owner,
      repo: input.repo,
      path: input.path,
      ref: input.ref
    });

    if (!Array.isArray(data)) {
      throw new AppError(`Path '${input.path}' is not a directory`, 400);
    }

    return result(`Directory ${input.path} contains ${data.length} items`, {
      path: input.path,
      count: data.length,
      items: data.map((item) => ({
        name: item.name,
        path: item.path,
        type: item.type,
        sha: item.sha,
        size: 'size' in item ? item.size : undefined
      }))
    });
  }
};
