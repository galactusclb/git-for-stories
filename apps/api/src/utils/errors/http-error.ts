class HttpError extends Error {
    statusCode: number;
    details?: unknown;

    constructor(statusCode: number, message: string, details?: unknown) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}

class BadRequestError extends HttpError {
    constructor(message = 'Bad request', details?: unknown) {
        super(400, message, details);
    }
}

class UnauthorizedError extends HttpError {
    constructor(message = 'Unauthorized', details?: unknown) {
        super(401, message, details);
    }
}

class ForbiddenError extends HttpError {
    constructor(message = 'Forbidden', details?: unknown) {
        super(403, message, details);
    }
}

class NotFoundError extends HttpError {
    constructor(message = 'Resource not found', details?: unknown) {
        super(404, message, details);
    }
}

class ConflictError extends HttpError {
    constructor(message = 'Conflict', details?: unknown) {
        super(409, message, details);
    }
}

class InternalServerError extends HttpError {
    constructor(message = 'Internal server error', details?: unknown) {
        super(500, message);
        this.details = details;
    }
}

class ServiceUnavailableError extends HttpError {
    constructor(message = 'Service unavailable', details?: number) {
        super(503, message);
        this.details = details;
    }
}

export {
    HttpError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    InternalServerError,
    ServiceUnavailableError,
};
