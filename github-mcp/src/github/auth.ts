import type { Octokit } from '@octokit/rest';

export interface AuthDiagnostics {
  hasToken: boolean;
  tokenTypeAssumption: 'pat_or_app' | 'none';
  apiBaseUrl: string;
}

export const getAuthDiagnostics = (octokit: Octokit): AuthDiagnostics => {
  return {
    hasToken: Boolean((octokit as any).auth),
    tokenTypeAssumption: (octokit as any).auth ? 'pat_or_app' : 'none',
    apiBaseUrl: octokit.request.endpoint.DEFAULTS.baseUrl
  };
};
