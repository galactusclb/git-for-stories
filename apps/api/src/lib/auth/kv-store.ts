import { LRUCache } from 'lru-cache';

import type { Redis as RedisClient } from 'ioredis';

const memory = new LRUCache<string, string>({
    max: 1000,
    ttl: 60 * 60 * 27 * 7,
});

export async function kvGet(
    redis: RedisClient | null | undefined,
    key: string
): Promise<string | null> {
    if (redis) {
        try {
            return await redis.get(key);
        } catch {
            return memory.get(key) ?? null;
        }
    }
    return memory.get(key) ?? null;
}

export async function kvSetEx(
    redis: RedisClient | null | undefined,
    key: string,
    ttlSeconds: number,
    value: string
): Promise<void> {
    if (redis) {
        try {
            await redis.setex(key, ttlSeconds, value);
            return;
        } catch {
            memory.set(key, value, { ttl: ttlSeconds * 1000 });
            return;
        }
    }
    memory.set(key, value, { ttl: ttlSeconds * 1000 });
}

export async function kvDel(redis: RedisClient | null | undefined, key: string): Promise<void> {
    if (redis) {
        try {
            await redis.del(key);
            return;
        } catch {
            memory.delete(key);
        }
        return;
    }
    memory.delete(key);
}
