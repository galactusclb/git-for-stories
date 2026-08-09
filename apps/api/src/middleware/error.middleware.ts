import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { logger } from '@/lib/logger/index.ts';
import { Prisma } from '@/prisma/client';

import { AppError, IsAuthMiddlewareMissingError } from '../utils/errors/app-errors.ts';
import { HttpError, LLMProviderError } from '../utils/errors/http-error.ts';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
    logger.error('[Error]', { err });

    let statusCode = 500;
    let message = 'Internal server error';
    let details: unknown;

    if (err instanceof IsAuthMiddlewareMissingError) {
        logger.error('[Implementation Bug]', { message: err.message });
        return res.status(500).json({ success: false, error: 'Something went wrong' });
    }

    if (isPrismaError(err)) {
        return res.status(500).json({
            success: false,
            error: 'Database error. Please try again later.',
            details: {
                code: (err as Prisma.PrismaClientKnownRequestError).code || 'DB_ERROR',
            },
        });
    }

    if (err instanceof HttpError) {
        if (err instanceof LLMProviderError) {
            logger.error('[LLM Provider Failure]', { details: err.details });
        }

        statusCode = err.statusCode;
        message = err.message;
        details = sanitizeDetails(err.details);

        return res.status(statusCode).json({ success: false, error: message, details });
    }

    if (err instanceof AppError) {
        statusCode = 400;
        message = err.message;

        if (typeof err.details === 'object' && err.details !== null) {
            details = { code: err.code, ...err.details };
        } else {
            details = { code: err.code, payload: err.details };
        }

        return res.status(statusCode).json({ success: false, error: message, details });
    }

    if (err instanceof Error) {
        return res.status(500).json({ success: false, error: message });
    }

    return res.status(500).json({ success: false, error: message });
}

function isPrismaError(err: unknown): err is Prisma.PrismaClientKnownRequestError {
    return (
        err instanceof Prisma.PrismaClientKnownRequestError ||
        err instanceof Prisma.PrismaClientUnknownRequestError ||
        err instanceof Prisma.PrismaClientRustPanicError ||
        err instanceof Prisma.PrismaClientInitializationError ||
        err instanceof Prisma.PrismaClientValidationError
    );
}

function sanitizeDetails(details: unknown): unknown {
    if (details instanceof ZodError) {
        return details.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
        }));
    }
    return details;
}
