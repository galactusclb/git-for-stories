import { randomUUID } from 'node:crypto';

import { BadRequestError } from '@/utils/errors/http-error';

import { ExtractedScene } from '../../domain/entities/extracted-scene';
import { Scene } from '../../domain/entities/scene';
import { Story } from '../../domain/entities/story';
import { collectMentions } from '../../domain/services/resolve-scenes';
import { SceneExtractor } from '../ports/scene-extractor.port';
import { SceneIndexingQueue } from '../ports/scene-indexing-queue.port';
import { StoryRepository } from '../ports/story-repository.port';

export class PullOutStoryUseCase {
    constructor(
        private readonly sceneExtractor: SceneExtractor,
        private readonly storyRepository: StoryRepository,
        private readonly sceneIndexingQueue: SceneIndexingQueue,
        private readonly embeddingModel: string,
    ) {}

    async execute(
        story: string,
        title: string,
    ): Promise<{
        storyId: string;
        title: string;
        scenes: Scene[];
    }> {
        const storyId = randomUUID();

        const extracted = await this.sceneExtractorFunc(story);

        const {} = await this.entityResolver.resolve(collectMentions(extracted));

        await this.saveStory({ id: storyId, title, scenes });
        await this.sceneIndexingQueue.requestIndexing({
            storyId,
            embeddingModel: this.embeddingModel,
        });

        return { storyId, title, scenes };
    }

    private async sceneExtractorFunc(story: string): Promise<ExtractedScene[]> {
        if (!story.trim()) {
            throw new BadRequestError('Story cannot be empty');
        }

        return await this.sceneExtractor.extract(story);
    }

    private async saveStory(story: Story): Promise<void> {
        await this.storyRepository.save(story);
    }
}
