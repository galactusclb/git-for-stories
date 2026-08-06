import { kvDel, kvGet, kvSetEx } from '@/lib/auth/kv-store.ts';

import type { Redis as RedisClient } from 'ioredis';

type OAuthStateData = {
    codeVerifier: string;
    returnTo: string;
};

const STATE_TTL_SECONDS = 10 * 60; // 10 min
const KEY_PREFIX = 'oauth:google:state:';

function keyForState(state: string) {
    return `${KEY_PREFIX}${state}`;
}

export async function saveGoogleOAuthState(
    redis: RedisClient | null | undefined,
    state: string,
    data: OAuthStateData
): Promise<void> {
    await kvSetEx(redis, keyForState(state), STATE_TTL_SECONDS, JSON.stringify(data));
}

export async function consumeGoogleOAuthState(
    redis: RedisClient | null | undefined,
    state: string
): Promise<OAuthStateData | null> {
    const key = keyForState(state);
    const raw = await kvGet(redis, key);
    if (!raw) return null;
    await kvDel(redis, key);
    try {
        return JSON.parse(raw) as OAuthStateData;
    } catch {
        return null;
    }
}
