import 'client-only';

import type { AxiosRequestConfig } from 'axios';
import { z } from 'zod';

import apiClient from '@/lib/axios';

import { ApiError } from './api-error';

type ApiEnvelopeResponseFailed = {
    success: boolean;
    error?: { message?: string; code?: string };
};

export async function apiGet<TSchema extends z.ZodTypeAny>(
    url: string,
    schema: TSchema,
    config?: AxiosRequestConfig
): Promise<z.infer<TSchema>> {
    try {
        const res = await apiClient.get(url, config);
        const parsed = schema.parse(res.data);
        checkIfEnvelopeFailed(parsed, res.status);
        return parsed;
    } catch (error: unknown) {
        parseThrowApiClientError(error);
    }
}

export async function apiPost<TSchema extends z.ZodTypeAny, TBody>(
    url: string,
    body: TBody,
    schema: TSchema,
    config?: AxiosRequestConfig
): Promise<z.infer<TSchema>> {
    try {
        const res = await apiClient.post(url, body, config);
        const parsed = schema.parse(res.data);
        checkIfEnvelopeFailed(parsed, res.status);
        return parsed;
    } catch (error: unknown) {
        parseThrowApiClientError(error);
    }
}

export async function apiPatch<TSchema extends z.ZodTypeAny, TBody>(
    url: string,
    body: TBody,
    schema: TSchema,
    config?: AxiosRequestConfig
): Promise<z.infer<TSchema>> {
    try {
        const res = await apiClient.patch(url, body, config);
        const parsed = schema.parse(res.data);
        checkIfEnvelopeFailed(parsed, res.status);
        return parsed;
    } catch (error: unknown) {
        parseThrowApiClientError(error);
    }
}

export async function apiDelete(url: string, config?: AxiosRequestConfig): Promise<void> {
    try {
        await apiClient.delete(url, config);
    } catch (error: unknown) {
        parseThrowApiClientError(error);
    }
}

function checkIfEnvelopeFailed(parsed: unknown, status?: number): void {
    if (!parsed || typeof parsed !== 'object') return;
    if (!('success' in parsed)) return;

    const envelope = parsed as ApiEnvelopeResponseFailed;
    if (envelope.success !== false) return;

    const message =
        (typeof envelope.error?.message === 'string' && envelope.error.message) || 'Request failed';

    throw new ApiError(message, {
        status,
        code: typeof envelope.error?.code === 'string' ? envelope.error.code : undefined,
        details: envelope.error,
    });
}

function zodToApiError(error: z.ZodError): ApiError {
    return new ApiError('Invalid API response format', {
        code: 'INVALID_RESPONSE',
        details: z.treeifyError(error),
    });
}

function parseThrowApiClientError(error: unknown): never {
    if (error instanceof z.ZodError) throw zodToApiError(error);
    if (error instanceof ApiError) throw error;
    throw new ApiError('Unexpected API error');
}
