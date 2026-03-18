import { z } from 'zod';
import type { GithubTool } from '../../types/tool.js';
import { result } from '../../utils/result.js';

const schema = z.object({});

export const getViewerTool: GithubTool<typeof schema> = {
  name: 'github_get_viewer',
  description: 'Get authenticated viewer details.',
  inputSchema: schema,
  execute: async (ctx) => {
    const { data } = await ctx.octokit.rest.users.getAuthenticated();
    return result(`Viewer ${data.login} loaded`, {
      login: data.login,
      id: data.id,
      name: data.name,
      email: data.email,
      html_url: data.html_url
    });
  }
};
