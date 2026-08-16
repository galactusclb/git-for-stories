import { JobProducer } from '@/lib/queue/interfaces/queue-provider.interface';

import {
    SceneIndexingQueue,
    SceneIndexingRequest,
} from '../../application/ports/scene-indexing-queue.port';

export const SCENE_INDEXING_QUEUE = 'story.scene-indexing';

export class QueuedSceneIndexing implements SceneIndexingQueue {
    constructor(private readonly producer: JobProducer) {}

    requestIndexing(request: SceneIndexingRequest): Promise<void> {
        return this.producer.enqueue(SCENE_INDEXING_QUEUE, request);
    }
}
