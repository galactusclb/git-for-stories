import { randomUUID } from 'node:crypto';

import { BadRequestError } from '@/utils/errors/http-error';

import { Scene } from '../../domain/entities/scene';
import { Story } from '../../domain/entities/story';
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

        console.log('extracting story....');

        const scenes = await this.sceneExtractorFunc(story);

        console.log('extracted story: Done ✅');
        console.log('saving Story...');

        await this.saveStory({ id: storyId, title, scenes });
        console.log('saving Story: Done ✅');
        await this.sceneIndexingQueue.requestIndexing({
            storyId,
            embeddingModel: this.embeddingModel,
        });

        console.log('send response ✅');
        return { storyId, title, scenes };
    }

    private async sceneExtractorFunc(story: string): Promise<Scene[]> {
        if (!story.trim()) {
            throw new BadRequestError('Story cannot be empty');
        }

        return await this.sceneExtractor.extract(story);
    }

    private async saveStory(story: Story): Promise<void> {
        await this.storyRepository.save(story);
    }
}
