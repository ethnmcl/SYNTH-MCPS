import type { Octokit } from '@octokit/rest';
import type { AppEnv } from '../config/env.js';

export interface GitHubContext {
  octokit: Octokit;
  env: AppEnv;
}
