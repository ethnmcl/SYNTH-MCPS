import { AppError } from '../utils/errors.js';
import type { AppEnv } from '../config/env.js';

export const ensureOwnerRepoAllowed = (env: AppEnv, owner: string, repo?: string): void => {
  if (env.allowedOwners.length > 0 && !env.allowedOwners.includes(owner)) {
    throw new AppError(`Owner '${owner}' is not in allowlist`, 403);
  }

  if (repo) {
    const fullName = `${owner}/${repo}`;
    if (env.allowedRepos.length > 0 && !env.allowedRepos.includes(fullName)) {
      throw new AppError(`Repository '${fullName}' is not in allowlist`, 403);
    }
  }
};

export const ensureWriteAllowed = (env: AppEnv): void => {
  if (env.githubReadOnly) {
    throw new AppError('Write operation blocked by GITHUB_READ_ONLY=true', 403);
  }
};
