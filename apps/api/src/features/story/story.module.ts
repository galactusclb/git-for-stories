import { EmbeddingProvider } from '@/lib/llm/interfaces/embedding-provider.interface';
import { LLMProvider } from '@/lib/llm/interfaces/llm-provider.interface';

import { AnswerStoryQuestionUseCase } from './application/use-cases/answer-story-question.use-case';
import { CreateSceneEmbeddingUseCase } from './application/use-cases/create-scene-embedding.use-case';
import { ExtractStoryScenesUseCase } from './application/use-cases/extract-story-scenes.use-case';
import { SaveSceneEmbeddingUseCase } from './application/use-cases/save-scene-embedding.use-case';
import { SaveStoryScenesUseCase } from './application/use-cases/save-story-scene.use-case';
import { LLMEmbeddingGenerator } from './infrastructure/llm/embedding-generator';
import { LLMSceneExtractor } from './infrastructure/llm/scene-extractor';
import { LLMSceneReasoner } from './infrastructure/llm/scene-reasoner';
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
    const sceneReasoner = new LLMSceneReasoner(llmProvider);

    const extractStoryScenes = new ExtractStoryScenesUseCase(sceneExtractor);
    const saveStoryScenes = new SaveStoryScenesUseCase(storyRepository);
    const createSceneEmbedding = new CreateSceneEmbeddingUseCase(embeddingGenerator);
    const saveSceneEmbeddingUseCase = new SaveSceneEmbeddingUseCase(embeddingRepository);
    const sceneReasoningUseCase = new AnswerStoryQuestionUseCase(
        embeddingGenerator,
        embeddingRepository,
        sceneReasoner
    );

    const controller = new StoryController(
        extractStoryScenes,
        saveStoryScenes,
        createSceneEmbedding,
        saveSceneEmbeddingUseCase,
        sceneReasoningUseCase
    );

    const router = createStoryRouter(controller);

    return router;
}
