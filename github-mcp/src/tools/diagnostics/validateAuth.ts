import { z } from 'zod';
import type { GithubTool } from '../../types/tool.js';
import { getAuthDiagnostics } from '../../github/auth.js';
import { result } from '../../utils/result.js';

const schema = z.object({});

export const validateAuthTool: GithubTool<typeof schema> = {
  name: 'github_validate_auth',
  description: 'Validate auth configuration and run minimal viewer check.',
  inputSchema: schema,
  execute: async (ctx) => {
    const auth = getAuthDiagnostics(ctx.octokit);
    let viewer: { login?: string; id?: number } | null = null;
    let viewerCheckError: string | null = null;

    try {
      const { data } = await ctx.octokit.rest.users.getAuthenticated();
      viewer = { login: data.login, id: data.id };
    } catch (error) {
      viewerCheckError = error instanceof Error ? error.message : String(error);
    }

    const { data: rateLimit } = await ctx.octokit.rest.rateLimit.get();

    return result('Auth diagnostics generated', {
      auth_configured: auth.hasToken,
      token_type_assumption: auth.tokenTypeAssumption,
      api_base_url: auth.apiBaseUrl,
      viewer,
      viewer_check_error: viewerCheckError,
      rate_limit: rateLimit.rate
    });
  }
};
