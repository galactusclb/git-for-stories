import { LLMProvider } from '@/lib/llm/llm-provider.interface';

import { ExtractStoryScenesUseCase } from './application/use-cases/extract-story-scenes.use-case';
import { SaveStoryScenesUseCase } from './application/use-cases/save-story-scene.use-case';
import { LLMSceneExtractor } from './infrastructure/llm/scene-extractor';
import { PostgresStoryRepository } from './infrastructure/persistence/postgres/story.repository';
import { StoryController } from './presentation/story.controller';
import { createStoryRouter } from './presentation/story.route';

interface StoryModuleDependencies {
    llmProvider: LLMProvider;
}

export function createStoryModule({ llmProvider }: StoryModuleDependencies) {
    const sceneExtractor = new LLMSceneExtractor(llmProvider);
    const storyRepository = new PostgresStoryRepository();

    const extractStoryScenes = new ExtractStoryScenesUseCase(sceneExtractor);

    const saveStoryScenes = new SaveStoryScenesUseCase(storyRepository);

    const controller = new StoryController(extractStoryScenes, saveStoryScenes);

    const router = createStoryRouter(controller);

    return router;
}
