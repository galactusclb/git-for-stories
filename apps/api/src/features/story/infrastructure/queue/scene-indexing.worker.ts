import { logger } from '@/lib/logger';
import type { JobConsumer, RunningWorker } from '@/lib/queue/interfaces/queue-provider.interface';

import { SceneIndexingRequest } from '../../application/ports/scene-indexing-queue.port';
import { IndexStoryScenesUseCase } from '../../application/use-cases/index-story-scenes.use-case';

import { SCENE_INDEXING_QUEUE } from './scene-indexing.queue';

export function startSceneIndexingWorker(
    consumer: JobConsumer,
    indexStoryScenes: IndexStoryScenesUseCase,
): RunningWorker {
    logger.info('scene indexing worker started', { queue: SCENE_INDEXING_QUEUE });

    return consumer.consume<SceneIndexingRequest>(
        SCENE_INDEXING_QUEUE,
        async ({ payload, attempt }) => {
            logger.info('indexing story scenes', { ...payload, attempt });
            await indexStoryScenes.execute(payload);
        },
    );
}
