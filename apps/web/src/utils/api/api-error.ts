import axios from 'axios';
import { z } from 'zod';

import { apiErrorSchema } from '@/models/api-response.schema';

export class ApiError extends Error {
    code?: string;
    status?: number;
    details?: unknown;

    constructor(message: string, opts?: { code?: string; status?: number; details?: unknown }) {
        super(message);
        this.name = 'ApiError';
        this.code = opts?.code;
        this.status = opts?.status;
        this.details = opts?.details;
    }
}

const unknownErrorMessage = 'Unexpected API error';

export function toApiError(error: unknown): ApiError {
    if (error instanceof ApiError) return error;

    if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data;

        const parsed = apiErrorSchema.safeParse(data?.error ?? data);
        if (parsed.success) {
            return new ApiError(parsed.data.message, { code: parsed.data.code, status });
        }

        const msg =
            (typeof data?.message === 'string' && data.message) ||
            (typeof error.message === 'string' && error.message) ||
            unknownErrorMessage;

        return new ApiError(msg, { status });
    }

    if (error instanceof z.ZodError)
        return new ApiError('Invalid API response format', {
            code: 'INVALID_RESPONSE',
            details: z.treeifyError(error),
        });
    if (error instanceof Error) return new ApiError(error.message || unknownErrorMessage);

    return new ApiError(unknownErrorMessage);
}

export function toFetchApiError(error: unknown): ApiError {
    if (error instanceof ApiError) return error;
    if (error instanceof z.ZodError)
        return new ApiError('Invalid API response format', {
            code: 'INVALID_RESPONSE',
            details: z.treeifyError(error),
        });
    if (error instanceof Error) return new ApiError(error.message || unknownErrorMessage);
    return new ApiError(unknownErrorMessage);
}
