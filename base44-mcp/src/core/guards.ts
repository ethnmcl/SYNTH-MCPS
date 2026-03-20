import { AppError } from './errors.js';

export const assertNonEmpty = (value: string | undefined, field: string): void => {
  if (!value || value.trim().length === 0) {
    throw new AppError(`Missing required value: ${field}`, 400, { field });
  }
};
