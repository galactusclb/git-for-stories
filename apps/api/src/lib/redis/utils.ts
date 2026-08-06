import { LRUCache } from 'lru-cache';


import { logger } from '@/lib/logger';
import { ServiceUnavailableError } from '@/utils/errors/http-error';

import { redisClient } from './redis-client';
class FetcherError {
    constructor(public cause: unknown) {}
}

type CachedValue<T> = {
    data: T;
    freshUntil: number;
};

type SwrOptions = {
    redis_fresh_ttl: number;
    redis_stale_ttl: number;
    lockTtl?: number;
};

const initOptions: Required<SwrOptions> = {
    redis_fresh_ttl: 60, //1min
    redis_stale_ttl: 300, //5min
    lockTtl: 10, //10s
};

const l2 = new LRUCache<string, string>({
    max: 500,
    ttl: 30 * 1000,
});

export async function swrCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    opts: SwrOptions = initOptions
) {
    try {
        const cached = await redisClient?.get(key);

        if (cached) {
            const entry: CachedValue<T> = JSON.parse(cached);

            if (Date.now() < entry.freshUntil) {
                return entry.data;
            }

            void refresh(key, fetcher, opts).catch((err) => {
                console.error(`[swr] background refresh failed for ${key}`, err);
            });
            return entry.data;
        }

        return refresh(key, fetcher, opts);
    } catch (error) {
        if (!(error instanceof ServiceUnavailableError)) throw error;
        logger.error(`[swr] Redis unavailable for ${key}, falling back to L2`, { error });
    }

    return lruHit(key, fetcher, opts);
}

async function refresh<T>(key: string, fetcher: () => Promise<T>, opts: SwrOptions): Promise<T> {
    const maxLockTtlMs = (opts.lockTtl ?? initOptions.lockTtl) * 1000;
    const minRetryIntervalMs = 30; //fetcher duration - min
    const maxRetryIntervalMs = 1000; //fetcher duration - max
    const maxRetryCount = 20;
    const jitterMs = 50; // de-sync simultaneous retries

    for (let attempt = 0; attempt < maxRetryCount; attempt++) {
        let result: T | null;

        try {
            result = await withLock(
                key,
                async () => {
                    let data: T;

                    try {
                        data = await fetcher();
                    } catch (cause) {
                        throw new FetcherError(cause);
                    }

                    try {
                        const entry: CachedValue<T> = {
                            data,
                            freshUntil: Date.now() + opts.redis_fresh_ttl * 1000,
                        };

                        await redisClient?.setex(key, opts.redis_stale_ttl, JSON.stringify(entry));
                    } catch {}

                    return data;
                },
                maxLockTtlMs
            );
        } catch (err) {
            if (err instanceof FetcherError) throw err.cause;
            throw new ServiceUnavailableError('Cache temporarily unavailable, please retry');
        }

        if (result !== null) return result;

        let cached: string | null | undefined;

        try {
            cached = await redisClient?.get(key);
        } catch {
            throw new ServiceUnavailableError('Cache temporarily unavailable, please retry');
        }

        if (cached) return (JSON.parse(cached) as CachedValue<T>).data;

        const delay =
            Math.min(minRetryIntervalMs * 2 ** attempt, maxRetryIntervalMs) +
            Math.random() * jitterMs;
        await new Promise((r) => setTimeout(r, delay));
    }

    throw new ServiceUnavailableError('Cache temporarily unavailable, please retry');
}

export async function withLock<T>(
    key: string,
    fn: () => Promise<T>,
    ttlMs: number = 5000
): Promise<T | null> {
    const lockKey = `${key}:lock`;
    const acquired = await redisClient?.set(lockKey, '1', 'PX', ttlMs, 'NX');

    if (!acquired) return null;

    try {
        return await fn();
    } finally {
        await redisClient?.del(lockKey);
    }
}

const l2Inflight = new Map<string, Promise<unknown>>();

async function lruHit<T>(key: string, fetcher: () => Promise<T>, opts: SwrOptions = initOptions) {
    const l2Hit = l2.get(key);
    if (l2Hit) return (JSON.parse(l2Hit) as CachedValue<T>).data;

    const inFlight = l2Inflight.get(key) as Promise<T> | undefined;
    if (inFlight) return inFlight;

    const promise = fetcher()
        .then((data) => {
            l2.set(
                key,
                JSON.stringify({ data, freshUntil: Date.now() + opts.redis_fresh_ttl * 1000 })
            );
            return data;
        })
        .finally(() => l2Inflight.delete(key));

    l2Inflight.set(key, promise);
    return promise;
}
