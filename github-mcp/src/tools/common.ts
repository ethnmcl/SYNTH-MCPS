import { Buffer } from 'node:buffer';
import { ensureOwnerRepoAllowed, ensureWriteAllowed } from '../github/permissions.js';
import { AppError, normalizeError } from '../utils/errors.js';
import type { GitHubContext } from '../types/github.js';

export const guardRepo = (ctx: GitHubContext, owner: string, repo?: string): void => {
  ensureOwnerRepoAllowed(ctx.env, owner, repo);
};

export const guardWrite = (ctx: GitHubContext): void => {
  ensureWriteAllowed(ctx.env);
};

export const decodeContent = (content: string, encoding: string): string => {
  if (encoding !== 'base64') {
    throw new AppError(`Unsupported content encoding '${encoding}'`, 400);
  }
  return Buffer.from(content, 'base64').toString('utf-8');
};

export const normalizeToolError = (error: unknown): never => {
  const normalized = normalizeError(error);
  throw new AppError(normalized.message, normalized.statusCode, normalized.details);
};
