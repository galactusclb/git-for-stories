import { Queue, Worker } from 'bullmq';

import { logger } from '@/lib/logger';

import {
    EnqueueOptions,
    JobConsumer,
    JobHandler,
    JobProducer,
    RunningWorker,
} from '../interfaces/queue-provider.interface';

import type { Redis as RedisClient } from 'ioredis';

const DEFAULT_JOB_OPTIONS = {
    attempts: 5,
    backoff: { type: 'exponential' as const, delay: 2_000 },
    removeOnComplete: 1_000,
    removeOnFail: 5_000,
};

export class BullMQJobProducer implements JobProducer {
    private readonly queues = new Map<string, Queue>();

    constructor(private readonly connection: RedisClient) {}

    async enqueue<T>(name: string, payload: T, options?: EnqueueOptions): Promise<void> {
        await this.queueFor(name).add(name, payload, {
            ...DEFAULT_JOB_OPTIONS,
            delay: options?.delaySeconds ? options.delaySeconds * 1_000 : undefined,
            jobId: options?.dedupeKey,
        });

        logger.info('job enqueued', { queue: name, dedupeKey: options?.dedupeKey });
    }

    private queueFor(name: string): Queue {
        const existing = this.queues.get(name);

        if (existing) return existing;

        const queue = new Queue(name, { connection: this.connection });
        this.queues.set(name, queue);

        return queue;
    }

    async close(): Promise<void> {
        await Promise.all([...this.queues.values()].map((queue) => queue.close()));
    }
}

export class BullMQJobConsumer implements JobConsumer {
    private readonly workers: Worker[] = [];

    constructor(private readonly connection: RedisClient) {}

    consume<T>(name: string, handler: JobHandler<T>): RunningWorker {
        const worker = new Worker<T>(
            name,
            (job) =>
                handler({
                    id: job.id ?? 'unknown',
                    payload: job.data,
                    attempt: job.attemptsMade + 1,
                }),
            {
                connection: this.connection,
                concurrency: 4,
            },
        );

        worker.on('failed', (job, err) =>
            logger.error('job failed', {
                queue: name,
                jobId: job?.id,
                attempt: (job?.attemptsMade ?? 0) + 1,
                err,
            }),
        );

        this.workers.push(worker);

        return { close: () => worker.close() };
    }

    async close(): Promise<void> {
        await Promise.all(this.workers.map((worker) => worker.close()));
        this.workers.length = 0;
    }
}
