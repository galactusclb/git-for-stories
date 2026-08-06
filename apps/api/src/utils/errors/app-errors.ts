export type AppErrorCode = 'VALIDATION_ERROR' | 'AUTH_ERROR' | 'DB_ERROR' | 'UNKNOWN_ERROR';

export class IsAuthMiddlewareMissingError extends Error {
    constructor(route?: string) {
        super(
            `[IsAuthMiddlewareMissingError] req.user is undefined${route ? ` on route "${route}"` : ''}. ` +
                `Did you forget to add the isAuth middleware?`
        );
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class AppError extends Error {
    code: AppErrorCode;
    details?: unknown;

    constructor(code: AppErrorCode, message: string, details?: unknown) {
        super(message);
        this.code = code;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}
