export class ObsidianMcpError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "ObsidianMcpError";
    this.code = code;
    this.details = details;
  }
}

export class ConfigError extends ObsidianMcpError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("CONFIG_ERROR", message, details);
  }
}

export class ValidationError extends ObsidianMcpError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("VALIDATION_ERROR", message, details);
  }
}

export class NotFoundError extends ObsidianMcpError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("NOT_FOUND", message, details);
  }
}

export class PermissionError extends ObsidianMcpError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("PERMISSION_DENIED", message, details);
  }
}

export class ConflictError extends ObsidianMcpError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("CONFLICT", message, details);
  }
}
