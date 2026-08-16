import { EmbeddingProvider } from '@/lib/llm/interfaces/embedding-provider.interface';
import { LLMProvider } from '@/lib/llm/interfaces/llm-provider.interface';
import { JobConsumer, JobProducer } from '@/lib/queue/interfaces/queue-provider.interface';

import { AnswerStoryQuestionUseCase } from './application/use-cases/answer-story-question.use-case';
import { IndexStoryScenesUseCase } from './application/use-cases/index-story-scenes.use-case';
import { PullOutStoryUseCase } from './application/use-cases/pullout-story.use-case';
import { LLMEmbeddingGenerator } from './infrastructure/llm/embedding-generator';
import { LLMSceneExtractor } from './infrastructure/llm/scene-extractor';
import { LLMSceneReasoner } from './infrastructure/llm/scene-reasoner';
import { PostgresEmbeddingRepository } from './infrastructure/persistence/postgres/embedding.repository';
import { PostgresStoryRepository } from './infrastructure/persistence/postgres/story.repository';
import { QueuedSceneIndexing } from './infrastructure/queue/scene-indexing.queue';
import { startSceneIndexingWorker } from './infrastructure/queue/scene-indexing.worker';
import { StoryController } from './presentation/story.controller';
import { createStoryRouter } from './presentation/story.route';

interface StoryModuleDependencies {
    llmProvider: LLMProvider;
    embeddingProvider: EmbeddingProvider;
    jobProducer: JobProducer;
    jobConsumer?: JobConsumer;
    embeddingModel: string;
}

export function createStoryModule({
    llmProvider,
    embeddingProvider,
    jobProducer,
    jobConsumer,
    embeddingModel,
}: StoryModuleDependencies) {
    //adapters
    const sceneExtractor = new LLMSceneExtractor(llmProvider);
    const embeddingGenerator = new LLMEmbeddingGenerator(embeddingProvider);
    const sceneReasoner = new LLMSceneReasoner(llmProvider);
    const storyRepository = new PostgresStoryRepository();
    const embeddingRepository = new PostgresEmbeddingRepository();
    const sceneIndexingQueue = new QueuedSceneIndexing(jobProducer);

    //use cases
    const pullOutStoryUseCase = new PullOutStoryUseCase(
        sceneExtractor,
        storyRepository,
        sceneIndexingQueue,
        embeddingModel,
    );

    const answerStoryQuestionUseCase = new AnswerStoryQuestionUseCase(
        embeddingGenerator,
        embeddingRepository,
        sceneReasoner,
        embeddingModel,
    );

    const indexStoryScenesUseCase = new IndexStoryScenesUseCase(
        storyRepository,
        embeddingGenerator,
        embeddingRepository,
    );

    // driving adapters
    const controller = new StoryController(pullOutStoryUseCase, answerStoryQuestionUseCase);
    const router = createStoryRouter(controller);

    const worker = jobConsumer
        ? startSceneIndexingWorker(jobConsumer, indexStoryScenesUseCase)
        : undefined;

    return {
        router,
        close: async () => {
            await worker?.close();
        },
    };
}
