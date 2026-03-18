import { Octokit } from '@octokit/rest';
import type { AppEnv } from '../config/env.js';

export const createGitHubClient = (config: AppEnv): Octokit => {
  return new Octokit({
    auth: config.githubToken,
    baseUrl: config.githubApiUrl,
    userAgent: config.githubUserAgent
  });
};
