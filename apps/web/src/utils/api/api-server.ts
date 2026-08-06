import 'server-only';

import { cookies, headers } from 'next/headers';
import { redirect, unstable_rethrow } from 'next/navigation';
import z from 'zod';

import { ROUTES } from '@/config/routes';

import { AUTH, PROXY_HEADERS } from '../constants/auth';
import { constants } from '../constants/env/server';

import { ApiError, toFetchApiError } from './api-error';

type FetchOutcome =
    | { ok: true; response: Response }
    | { ok: false; status: number; message: string };

export const apiServer = async <T extends z.ZodTypeAny>(
    path: string,
    schema: T,
    init?: RequestInit,
    allowRetryOn401: boolean = false
): Promise<z.infer<T>> => {
    try {
        const response = await fetchOrRedirect(path, init, allowRetryOn401);
        return schema.parse(await response.json());
    } catch (error) {
        unstable_rethrow(error);
        if (error instanceof DOMException && error.name === 'AbortError') throw error;
        logError(init?.method, path, error);
        throw toFetchApiError(error);
    }
};

export const apiCacheable = async <T extends z.ZodTypeAny>(
    path: string,
    schema: T,
    init?: RequestInit
): Promise<z.infer<T>> => {
    try {
        const response = await fetch(`${constants.API.URL}${path}`, {
            ...init,
            headers: {
                'Content-Type': 'application/json',
                ...init?.headers,
            },
        });

        if (!response.ok) {
            const { status, message } = await parseErrorBody(response);
            throw new ApiError(message, { status });
        }

        return schema.parse(await response.json());
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') throw error;
        logError(init?.method, path, error);
        throw toFetchApiError(error);
    }
};

async function baseFetch(
    path: string,
    init?: RequestInit,
    allowRetryOn401: boolean = false
): Promise<FetchOutcome> {
    const cookieStore = await cookies();

    const doFetch = () =>
        fetch(`${constants.API.URL}${path}`, {
            cache: 'no-store',
            ...init,
            headers: {
                'Content-Type': 'application/json',
                ...init?.headers,
                Cookie: cookieStore.toString(),
            },
        });

    let response = await doFetch();

    if (response.ok) return { ok: true, response };

    if (response.status === 401 && allowRetryOn401 && (await tokenRotation())) {
        response = await doFetch();
        if (response.ok) return { ok: true, response };
    }

    const { status, message } = await parseErrorBody(response);
    return { ok: false, status, message };
}

async function fetchOrRedirect(
    path: string,
    init: RequestInit | undefined,
    allowRetryOn401: boolean
): Promise<Response> {
    const outcome = await baseFetch(path, init, allowRetryOn401);
    if (outcome.ok) return outcome.response;

    if (outcome.status === 401) {
        const returnTo = await currentPath();
        redirect(`${ROUTES.login}?${AUTH.QUERY_PARAMS.RETURN_TO}=${encodeURIComponent(returnTo)}`);
    }

    throw new ApiError(outcome.message, { status: outcome.status });
}

export async function callRefreshEndpoint(cookieString: string): Promise<Response> {
    return await fetch(`${constants.API.URL}/auth/refresh`, {
        method: 'POST',
        cache: 'no-store',
        headers: {
            Cookie: cookieString,
        },
    });
}

async function tokenRotation(): Promise<boolean> {
    const cookieStore = await cookies();
    const response = await callRefreshEndpoint(cookieStore.toString());

    if (!response.ok) return false;

    try {
        for (const raw of response.headers.getSetCookie()) {
            const [nameValue, ...parts] = raw.split(';');
            const eqIdx = nameValue.indexOf('=');
            const name = nameValue.slice(0, eqIdx).trim();
            const value = nameValue.slice(eqIdx + 1).trim();

            // Preserve the original attributes (HttpOnly, Path, SameSite, etc.)
            const attrs = Object.fromEntries(
                parts.map((p) => p.trim().split('=')).map(([k, v]) => [k.toLowerCase(), v ?? true])
            );

            cookieStore.set(name, value, {
                httpOnly: !!attrs['httponly'],
                secure: !!attrs['secure'],
                path: typeof attrs['path'] === 'string' ? attrs['path'] : '/',
                sameSite: attrs['samesite'] as 'lax' | 'strict' | 'none' | undefined,
            });
        }
    } catch {
        console.warn(
            '[apiServer] tokenRotation cannot set cookies in this context. Use allowRetryOn401: true only from Server Actions.'
        );
        return false;
    }

    return true;
}

function logError(method: string | undefined, path: string, error: unknown): void {
    const ctx = { method: method ?? 'GET', path };

    if (error instanceof ApiError) {
        console.error('[apiServer]', {
            ...ctx,
            status: error.status,
            code: error.code,
            message: error.message,
            details: error.details,
        });
    } else if (error instanceof z.ZodError) {
        console.error('[apiServer]', { ...ctx, type: 'ZodError', issues: z.treeifyError(error) });
    } else if (error instanceof Error) {
        console.error('[apiServer]', { ...ctx, message: error.message, stack: error.stack });
    } else {
        console.error('[apiServer]', { ...ctx, error });
    }
}

async function currentPath(): Promise<string> {
    const h = await headers();
    const pathName = h.get(PROXY_HEADERS.PATHNAME) ?? '/';
    const search = h.get(PROXY_HEADERS.SEARCH) ?? '';
    return `${pathName}${search}`;
}

async function parseErrorBody(response: Response): Promise<{ status: number; message: string }> {
    const data = await response.json().catch(() => ({}));
    const message = typeof data?.error === 'string' ? data.error : 'Request failed';
    return { status: response.status, message };
}
