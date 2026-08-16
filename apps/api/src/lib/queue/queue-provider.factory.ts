import { getRedisClient, RedisConfig } from '@/lib/redis/redis-client';

import { JobConsumer, JobProducer } from './interfaces/queue-provider.interface';
import { BullMQJobConsumer, BullMQJobProducer } from './providers/bullMQ.provider';

type QueueProviderName = 'bullmq';

function redisConfig(): RedisConfig {
    return process.env.REDIS_CLIENT_URL
        ? { url: process.env.REDIS_CLIENT_URL, host: '', port: 6379 }
        : { host: process.env.REDIS_HOST ?? 'localhost', port: 6379 };
}

export function createQueueJobProducer(name: QueueProviderName): JobProducer {
    switch (name) {
        case 'bullmq':
            return new BullMQJobProducer(getRedisClient(redisConfig()));

        default:
            throw new Error(`Unknown queue provider: ${name}`);
    }
}

export function createJobConsumer(name: QueueProviderName): JobConsumer {
    switch (name) {
        case 'bullmq':
            return new BullMQJobConsumer(getRedisClient(redisConfig()).duplicate());

        default:
            throw new Error(`Unknown queue provider: ${name}`);
    }
}
