import { AppError } from '../core/errors.js';
import type { Env } from './env.js';

export const ensureDestructiveAllowed = (env: Env, confirmDangerous?: boolean): void => {
  if (!confirmDangerous) {
    throw new AppError('Destructive action requires confirmDangerous=true', 400, {
      code: 'CONFIRM_DANGEROUS_REQUIRED'
    });
  }
  if (!env.ALLOW_DESTRUCTIVE_TOOLS) {
    throw new AppError('Destructive tools are disabled by ALLOW_DESTRUCTIVE_TOOLS', 403, {
      code: 'DESTRUCTIVE_TOOLS_DISABLED'
    });
  }
};
