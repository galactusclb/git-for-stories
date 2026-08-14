import { LLMProviderError } from '@/utils/errors/http-error';

import { SceneSearchResult } from '../../domain/entities/scene-search-result';
import { EmbeddingGenerator } from '../ports/embedding-generator.port';
import { EmbeddingRespository } from '../ports/embedding-repository.port';
import { SceneAnswer, SceneReasoner } from '../ports/scene-reasoner.port';

export interface AnswerStoryQuestionResult extends SceneAnswer {
    scenes: SceneSearchResult[];
}

export class AnswerStoryQuestionUseCase {
    constructor(
        private readonly embeddingGenerator: EmbeddingGenerator,
        private readonly embeddingRespository: EmbeddingRespository,
        private readonly sceneReasoner: SceneReasoner
    ) {}

    async execute(
        storyId: string,
        question: string,
        limit: number
    ): Promise<AnswerStoryQuestionResult> {
        const [queryEmbedding] = await this.embeddingGenerator.generate(question);

        if (!queryEmbedding) {
            throw new LLMProviderError('Embedding provider returned no vector for the query');
        }

        const scenes = await this.embeddingRespository.searchSimilarScenes(
            storyId,
            queryEmbedding,
            limit
        );

        if (!scenes.length) {
            return {
                answer: 'No indexed scenes were found f or this story',
                usedSceneIds: [],
                scenes: [],
            };
        }

        const { answer, usedSceneIds } = await this.sceneReasoner.reason(question, scenes);

        return { answer, usedSceneIds, scenes };
    }
}
