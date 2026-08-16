export interface JobMessage<T> {
    id: string;
    payload: T;
    attempt: number;
}

export interface EnqueueOptions {
    delaySeconds?: number;
    dedupeKey?: string;
}

export type JobHandler<T> = (message: JobMessage<T>) => Promise<void>;

export interface RunningWorker {
    close(): Promise<void>;
}

export interface JobProducer {
    enqueue<T>(name: string, payload: T, options?: EnqueueOptions): Promise<void>;
    close(): Promise<void>;
}

export interface JobConsumer {
    consume<T>(name: string, handler: JobHandler<T>): RunningWorker;
    close(): Promise<void>;
}
