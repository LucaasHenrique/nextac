export class AppError extends Error {
    statusCode: number;
    code: string;
    details?: unknown;

    constructor(statusCode: number, code: string, message: string, details?: unknown) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
    }
}

export class ServiceError extends AppError {
    constructor(statusCode: number, message: string, details?: unknown, code = "SERVICE_ERROR") {
        super(statusCode, code, message, details);
    }
}

export class BadRequestError extends ServiceError {
    constructor(message: string, details?: unknown) {
        super(400, message, details, "BAD_REQUEST");
    }
}

export class UnauthorizedError extends ServiceError {
    constructor(message = "Unauthorized", details?: unknown) {
        super(401, message, details, "UNAUTHORIZED");
    }
}

export class ForbiddenError extends ServiceError {
    constructor(message = "Forbidden", details?: unknown) {
        super(403, message, details, "FORBIDDEN");
    }
}

export class NotFoundError extends ServiceError {
    constructor(message: string, details?: unknown) {
        super(404, message, details, "NOT_FOUND");
    }
}

export class ConflictError extends ServiceError {
    constructor(message: string, details?: unknown) {
        super(409, message, details, "CONFLICT");
    }
}

export class ValidationError extends ServiceError {
    constructor(message: string, details?: unknown) {
        super(422, message, details, "VALIDATION_ERROR");
    }
}
