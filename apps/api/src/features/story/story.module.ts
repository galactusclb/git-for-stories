import { EmbeddingProvider } from '@/lib/llm/interfaces/embedding-provider.interface';
import { LLMProvider } from '@/lib/llm/interfaces/llm-provider.interface';

import { CreateSceneEmbeddingUseCase } from './application/use-cases/create-scene-embedding.use-case';
import { CreateSceneSementicSearchUseCase } from './application/use-cases/create-scene-sementic-search-embedding.use-case';
import { ExtractStoryScenesUseCase } from './application/use-cases/extract-story-scenes.use-case';
import { SaveSceneEmbeddingUseCase } from './application/use-cases/save-scene-embedding.use-case';
import { SaveStoryScenesUseCase } from './application/use-cases/save-story-scene.use-case';
import { SceneSimiliratySearchUseCase } from './application/use-cases/scene-similiraty-search.use-case';
import { LLMEmbeddingGenerator } from './infrastructure/llm/embedding-generator';
import { LLMSceneExtractor } from './infrastructure/llm/scene-extractor';
import { PostgresEmbeddingRepository } from './infrastructure/persistence/postgres/embedding.repository';
import { PostgresStoryRepository } from './infrastructure/persistence/postgres/story.repository';
import { StoryController } from './presentation/story.controller';
import { createStoryRouter } from './presentation/story.route';

interface StoryModuleDependencies {
    llmProvider: LLMProvider;
    embeddingProvider: EmbeddingProvider;
}

export function createStoryModule({ llmProvider, embeddingProvider }: StoryModuleDependencies) {
    const sceneExtractor = new LLMSceneExtractor(llmProvider);
    const embeddingGenerator = new LLMEmbeddingGenerator(embeddingProvider);
    const storyRepository = new PostgresStoryRepository();
    const embeddingRepository = new PostgresEmbeddingRepository();

    const extractStoryScenes = new ExtractStoryScenesUseCase(sceneExtractor);

    const saveStoryScenes = new SaveStoryScenesUseCase(storyRepository);
    const createSceneEmbedding = new CreateSceneEmbeddingUseCase(embeddingGenerator);
    const saveSceneEmbeddingUseCase = new SaveSceneEmbeddingUseCase(embeddingRepository);
    const createSceneSementicSearchUseCase = new CreateSceneSementicSearchUseCase(
        embeddingGenerator
    );
    const sceneSimiliratySearchUseCase = new SceneSimiliratySearchUseCase(embeddingRepository);

    const controller = new StoryController(
        extractStoryScenes,
        saveStoryScenes,
        createSceneEmbedding,
        saveSceneEmbeddingUseCase,
        createSceneSementicSearchUseCase,
        sceneSimiliratySearchUseCase
    );

    const router = createStoryRouter(controller);

    return router;
}
