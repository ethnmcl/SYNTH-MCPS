export class AppError extends Error {
    code;
    status;
    details;
    constructor(code, message, status = 400, details) {
        super(message);
        this.code = code;
        this.status = status;
        this.details = details;
    }
}
export class AuthzError extends AppError {
    constructor(message, details) {
        super("AUTHZ_DENIED", message, 403, details);
    }
}
export class ValidationError extends AppError {
    constructor(message, details) {
        super("VALIDATION_ERROR", message, 400, details);
    }
}
export class ExternalApiError extends AppError {
    constructor(message, details) {
        super("EXTERNAL_API_ERROR", message, 502, details);
    }
}
export class NotImplementedFeatureError extends AppError {
    constructor(message, details) {
        super("NOT_IMPLEMENTED", message, 501, details);
    }
}
