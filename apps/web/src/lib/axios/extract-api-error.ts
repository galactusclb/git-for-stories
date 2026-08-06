import { ApiError } from '@/utils/api/api-error';

type ApiPayload = { error?: { message?: string; code?: string }; message?: string };

export const extractApiError = (response: { status: number; data: unknown }): ApiError => {
    const payload =
        response.data && typeof response.data === 'object'
            ? (response.data as ApiPayload)
            : undefined;

    const message = payload?.error?.message || payload?.message || 'Request failed';
    const code = payload?.error?.code;
    return new ApiError(message, { status: response.status, code });
};
