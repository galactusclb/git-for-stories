import { logger } from '@/lib/logger';
import { LLMProviderError, LLMUnavailableError } from '@/utils/errors/http-error';

import { SceneSearchResult } from '../../domain/entities/scene-search-result';
import { EmbeddingGenerator } from '../ports/embedding-generator.port';
import { EmbeddingRespository } from '../ports/embedding-repository.port';
import { SceneReasoner } from '../ports/scene-reasoner.port';

export type AnswerStatus = 'answered' | 'no_scenes' | 'reasoning_unavailable';

export interface AnswerStoryQuestionResult {
    status: AnswerStatus;
    answer: string | null;
    usedSceneIds: string[];
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
        limit: number,
        embeddingModel: string
    ): Promise<AnswerStoryQuestionResult> {
        const [queryEmbedding] = await this.embeddingGenerator.generate([question]);

        if (!queryEmbedding) {
            throw new LLMProviderError('Embedding provider returned no vector for the query');
        }

        const scenes = await this.embeddingRespository.searchSimilarScenes(
            storyId,
            queryEmbedding,
            limit,
            embeddingModel
        );

        if (!scenes.length) {
            return {
                status: 'no_scenes',
                answer: null,
                usedSceneIds: [],
                scenes: [],
            };
        }

        try {
            const { answer, usedSceneIds } = await this.sceneReasoner.reason(question, scenes);
            return { status: 'answered', answer, usedSceneIds, scenes };
        } catch (error) {
            if (error instanceof LLMUnavailableError) {
                logger.warn('[Reasoning degraded]', { storyId, sceneCount: scenes.length });
                return {
                    status: 'reasoning_unavailable',
                    answer: null,
                    usedSceneIds: [],
                    scenes,
                };
            }

            throw error;
        }
    }
}
