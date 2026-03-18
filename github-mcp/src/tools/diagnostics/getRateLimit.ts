import { z } from 'zod';
import type { GithubTool } from '../../types/tool.js';
import { result } from '../../utils/result.js';

const schema = z.object({});

export const getRateLimitTool: GithubTool<typeof schema> = {
  name: 'github_get_rate_limit',
  description: 'Get current API rate limit status.',
  inputSchema: schema,
  execute: async (ctx) => {
    const { data } = await ctx.octokit.rest.rateLimit.get();
    return result('Rate limit status loaded', {
      rate: data.rate,
      resources: data.resources
    });
  }
};
