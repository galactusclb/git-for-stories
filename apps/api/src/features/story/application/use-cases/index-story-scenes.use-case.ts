import { logger } from '@/lib/logger';
import { LLMProviderError } from '@/utils/errors/http-error';

import { SceneEmbedding } from '../../domain/entities/scene-embedding';
import { toEmbeddingInput } from '../../domain/services/scene-embedding-input';
import { EmbeddingGenerator } from '../ports/embedding-generator.port';
import { EmbeddingRespository } from '../ports/embedding-repository.port';
import { SceneIndexingRequest } from '../ports/scene-indexing-queue.port';
import { StoryRepository } from '../ports/story-repository.port';

export class IndexStoryScenesUseCase {
    constructor(
        private readonly storyRepository: StoryRepository,
        private readonly embeddingGenerator: EmbeddingGenerator,
        private readonly embeddingRepository: EmbeddingRespository,
    ) {}

    async execute({ storyId, embeddingModel }: SceneIndexingRequest): Promise<void> {
        console.log('[background queue] Running story');

        const scenes = await this.storyRepository.findScenesByStory(storyId);

        if (scenes.length === 0) {
            logger.warn('indexing requested for story with no scenes', { storyId });
            return;
        }

        console.log('Running story background queue;');
        const embeddings = await this.embeddingGenerator.generate(scenes.map(toEmbeddingInput));

        if (embeddings.length !== scenes.length) {
            throw new LLMProviderError(
                `Embedding count mismatch: expected ${scenes.length}, received ${embeddings.length}`,
            );
        }

        const sceneEmbeddings: SceneEmbedding[] = scenes.map((scene, index) => ({
            sceneId: scene.id,
            embedding: embeddings[index],
        }));
        console.log('[background queue] embedding received ✅');

        await this.embeddingRepository.saveMany(sceneEmbeddings, embeddingModel);
        console.log('[background queue] save in db ✅');

        logger.info('story scenes indexed', { storyId, count: sceneEmbeddings.length });
        console.log('[background queue] done ✅');
    }
}
