export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 500,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const normalizeError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (typeof error === 'object' && error !== null) {
    const maybeError = error as { message?: string; status?: number; response?: { data?: unknown } };
    if (maybeError.message) {
      const status = maybeError.status ?? 500;
      return new AppError(maybeError.message, status, maybeError.response?.data);
    }
  }

  if (error instanceof Error) {
    return new AppError(error.message);
  }

  return new AppError('Unknown error');
};
