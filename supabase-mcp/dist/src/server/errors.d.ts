export declare class AppError extends Error {
    readonly code: string;
    readonly status: number;
    readonly details?: Record<string, unknown>;
    constructor(code: string, message: string, status?: number, details?: Record<string, unknown>);
}
export declare class AuthzError extends AppError {
    constructor(message: string, details?: Record<string, unknown>);
}
export declare class ValidationError extends AppError {
    constructor(message: string, details?: Record<string, unknown>);
}
export declare class ExternalApiError extends AppError {
    constructor(message: string, details?: Record<string, unknown>);
}
export declare class NotImplementedFeatureError extends AppError {
    constructor(message: string, details?: Record<string, unknown>);
}
