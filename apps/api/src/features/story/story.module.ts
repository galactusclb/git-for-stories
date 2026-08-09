import { LLMProvider } from '@/lib/llm/llm-provider.interface';

import { ExtractStoryScenesUseCase } from './application/use-cases/extract-story-scenes.use-case';
import { LLMSceneExtractor } from './infrastructure/scene-extractor';
import { StoryController } from './presentation/story.controller';
import { createStoryRouter } from './presentation/story.route';

interface StoryModuleDependencies {
    llmProvider: LLMProvider;
}

export function createStoryModule({ llmProvider }: StoryModuleDependencies) {
    const sceneExtractor = new LLMSceneExtractor(llmProvider);

    const extractStoryScenes = new ExtractStoryScenesUseCase(sceneExtractor);

    const controller = new StoryController(extractStoryScenes);

    const router = createStoryRouter(controller);

    return router;
}
