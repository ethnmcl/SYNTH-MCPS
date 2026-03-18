import { z } from 'zod';
import { ownerRepoPathSchema } from '../../schemas/common.js';
import type { GithubTool } from '../../types/tool.js';
import { decodeContent, guardRepo } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoPathSchema.extend({
  ref: z.string().optional()
});

export const getRepoContentsTool: GithubTool<typeof schema> = {
  name: 'github_get_repo_contents',
  description: 'Get repository content entry (file or directory) by path.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.repos.getContent({
      owner: input.owner,
      repo: input.repo,
      path: input.path,
      ref: input.ref
    });

    if (Array.isArray(data)) {
      return result(`Directory ${input.path} contains ${data.length} items`, {
        kind: 'directory',
        path: input.path,
        items: data.map((item) => ({
          name: item.name,
          path: item.path,
          type: item.type,
          sha: item.sha,
          size: 'size' in item ? item.size : undefined
        }))
      });
    }

    if (data.type !== 'file') {
      return result(`Loaded ${data.type} entry ${data.path}`, {
        kind: data.type,
        path: data.path,
        sha: data.sha,
        html_url: data.html_url,
        download_url: data.download_url
      });
    }

    return result(`Loaded file ${data.path}`, {
      kind: 'file',
      path: data.path,
      sha: data.sha,
      size: data.size,
      content: decodeContent(data.content, data.encoding ?? 'base64'),
      html_url: data.html_url,
      download_url: data.download_url
    });
  }
};
