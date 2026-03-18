import { z } from 'zod';
import { ownerRepoPathSchema } from '../../schemas/common.js';
import { AppError } from '../../utils/errors.js';
import type { GithubTool } from '../../types/tool.js';
import { decodeContent, guardRepo } from '../common.js';
import { result } from '../../utils/result.js';
import { truncate } from '../../utils/text.js';

const schema = ownerRepoPathSchema.extend({
  ref: z.string().optional(),
  max_chars: z.number().int().min(200).max(200_000).default(20_000)
});

export const readFileTool: GithubTool<typeof schema> = {
  name: 'github_read_file',
  description: 'Read a UTF-8 text file from a repository.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.repos.getContent({
      owner: input.owner,
      repo: input.repo,
      path: input.path,
      ref: input.ref
    });

    if (Array.isArray(data) || data.type !== 'file' || !data.content) {
      throw new AppError(`Path '${input.path}' is not a readable file`, 400);
    }

    const text = decodeContent(data.content, data.encoding ?? 'base64');
    return result(`Read file ${data.path}`, {
      path: data.path,
      sha: data.sha,
      size: data.size,
      content: truncate(text, input.max_chars),
      truncated: text.length > input.max_chars
    });
  }
};
