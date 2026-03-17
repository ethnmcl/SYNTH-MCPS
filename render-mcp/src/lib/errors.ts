export type ErrorCode =
  | "VALIDATION_ERROR"
  | "POLICY_ERROR"
  | "RENDER_API_ERROR"
  | "NOT_FOUND"
  | "UNSUPPORTED_OPERATION"
  | "INTERNAL_ERROR";

export interface ErrorDetails {
  retryable?: boolean;
  status?: number;
  cause?: unknown;
  meta?: Record<string, unknown>;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly details: ErrorDetails;

  public constructor(code: ErrorCode, message: string, details: ErrorDetails = {}) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  public constructor(message: string, details: ErrorDetails = {}) {
    super("VALIDATION_ERROR", message, details);
  }
}

export class PolicyError extends AppError {
  public constructor(message: string, details: ErrorDetails = {}) {
    super("POLICY_ERROR", message, details);
  }
}

export class RenderApiError extends AppError {
  public constructor(message: string, details: ErrorDetails = {}) {
    super("RENDER_API_ERROR", message, details);
  }
}

export class NotFoundError extends AppError {
  public constructor(message: string, details: ErrorDetails = {}) {
    super("NOT_FOUND", message, details);
  }
}

export class UnsupportedOperationError extends AppError {
  public constructor(message: string, details: ErrorDetails = {}) {
    super("UNSUPPORTED_OPERATION", message, details);
  }
}

export function normalizeUnknownError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  if (error instanceof Error) {
    return new AppError("INTERNAL_ERROR", error.message, { cause: error });
  }
  return new AppError("INTERNAL_ERROR", "Unknown error", { cause: error });
}
