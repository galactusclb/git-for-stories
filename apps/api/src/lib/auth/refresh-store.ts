import { kvDel, kvGet, kvSetEx } from './kv-store.ts';
import { randomToken, sha256Hex } from './token-utils.ts';

import type { Redis as RedisClient } from 'ioredis';

export type RefreshSession = {
    userId: string;
    sessionId: string;
};

const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; // 7d
const KEY_PREFIX = 'auth:refresh:';

function keyForHash(hash: string) {
    return `${KEY_PREFIX}${hash}`;
}

export function issueRefreshToken(): { token: string; tokenHash: string; sessionId: string } {
    const token = randomToken(48);
    const tokenHash = sha256Hex(token);
    const sessionId = randomToken(16);
    return { token, tokenHash, sessionId };
}

export async function saveRefreshSession(
    redis: RedisClient | null | undefined,
    tokenHash: string,
    session: RefreshSession
): Promise<void> {
    await kvSetEx(redis, keyForHash(tokenHash), REFRESH_TTL_SECONDS, JSON.stringify(session));
}

export async function getRefreshSession(
    redis: RedisClient | null | undefined,
    tokenHash: string
): Promise<RefreshSession | null> {
    const raw = await kvGet(redis, keyForHash(tokenHash));
    if (!raw) return null;
    try {
        return JSON.parse(raw) as RefreshSession;
    } catch {
        return null;
    }
}

export async function revokeRefreshSession(
    redis: RedisClient | null | undefined,
    tokenHash: string
): Promise<void> {
    await kvDel(redis, keyForHash(tokenHash));
}

export async function rotateRefreshSession(
    redis: RedisClient | null | undefined,
    oldTokenHash: string,
    newTokenHash: string,
    session: RefreshSession
): Promise<void> {
    await revokeRefreshSession(redis, oldTokenHash);
    await saveRefreshSession(redis, newTokenHash, session);
}
