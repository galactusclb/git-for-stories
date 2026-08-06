import { Redis } from 'ioredis';

import { traceAsync } from '@/lib/aws/xray';

import type { Redis as RedisClient } from 'ioredis';


export * as redisUtils from './utils';

export type RedisConfig = {
    url?: string;
    host: string;
    port: number;
    password?: string;
    db?: number;
};

type RedisCommandFn = (...args: unknown[]) => Promise<unknown>;

const TRACED_COMMANDS = [
    'get',
    'set',
    'setex',
    'setnx',
    'getex',
    'del',
    'exists',
    'expire',
    'ttl',
    'hget',
    'hset',
    'hdel',
    'hgetall',
    'hmset',
    'sadd',
    'srem',
    'smembers',
    'incr',
    'decr',
] as const;

export let redisClient: RedisClient | null = null;

export function getRedisClient(config: RedisConfig): RedisClient {
    if (!redisClient) {
        redisClient = config.url
            ? new Redis(config.url, {
                  maxRetriesPerRequest: null,
              })
            : new Redis({
                  host: config.host,
                  port: config.port,
                  password: config.password,
                  db: config.db,
                  maxRetriesPerRequest: null,
              });

        redisClient.on('error', (err) => {
            console.error('[redis]', err);
        });

        traceRedis(redisClient);
    }

    return redisClient;
}

function traceRedis(client: RedisClient): void {
    TRACED_COMMANDS.forEach((cmd) => {
        const original = (client[cmd] as RedisCommandFn).bind(client);
        Object.assign(client, {
            [cmd]: (...args: unknown[]) => traceAsync(`redis:${cmd}`, () => original(...args)),
        });
    });
}
