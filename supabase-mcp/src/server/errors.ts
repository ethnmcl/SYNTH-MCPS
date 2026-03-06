export class AppError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: Record<string, unknown>;

  constructor(code: string, message: string, status = 400, details?: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class AuthzError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("AUTHZ_DENIED", message, 403, details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("VALIDATION_ERROR", message, 400, details);
  }
}

export class ExternalApiError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("EXTERNAL_API_ERROR", message, 502, details);
  }
}

export class NotImplementedFeatureError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("NOT_IMPLEMENTED", message, 501, details);
  }
}
