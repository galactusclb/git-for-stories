import { logger } from '@/lib/logger';
import { LLMProviderError, LLMUnavailableError } from '@/utils/errors/http-error';

import { SceneSearchResult } from '../../domain/entities/scene-search-result';
import { EmbeddingGenerator } from '../ports/embedding-generator.port';
import { EmbeddingRespository } from '../ports/embedding-repository.port';
import { SceneReasoner } from '../ports/scene-reasoner.port';

export type AnswerStatus =
    | 'answered'
    | 'no_scenes'
    | 'no_relevant_scenes'
    | 'reasoning_unavailable';

const MIN_SIMILARITY = 0.55;
const RELATIVE_WINDOW = 0.12;
const MAX_CONTEXT_SCENES = 6;

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
        private readonly sceneReasoner: SceneReasoner,
        private readonly embeddingModel: string,
    ) {}

    async execute(
        storyId: string,
        question: string,
        limit: number,
    ): Promise<AnswerStoryQuestionResult> {
        // TODO: Need to check story is available or not

        const [queryEmbedding] = await this.embeddingGenerator.generate([question]);

        if (!queryEmbedding) {
            throw new LLMProviderError('Embedding provider returned no vector for the query');
        }

        const scenes = await this.embeddingRespository.searchSimilarScenes(
            storyId,
            queryEmbedding,
            limit,
            this.embeddingModel,
        );

        if (!scenes.length) {
            return {
                status: 'no_scenes',
                answer: null,
                usedSceneIds: [],
                scenes: [],
            };
        }

        const relevantScenes = scenes
            .filter((s) => s.similarity >= MIN_SIMILARITY)
            .filter((s) => s.similarity >= scenes[0].similarity - RELATIVE_WINDOW)
            .slice(0, MAX_CONTEXT_SCENES);

        if (!relevantScenes.length) {
            return { status: 'no_relevant_scenes', answer: null, usedSceneIds: [], scenes };
        }

        try {
            const { answer, usedSceneIds } = await this.sceneReasoner.reason(
                question,
                relevantScenes,
            );

            const shownIds = new Set(relevantScenes.map((s) => s.sceneId));
            const usedSceneIdsParsed = usedSceneIds.filter((id) => shownIds.has(id));

            if (usedSceneIdsParsed.length !== usedSceneIds.length) {
                logger.warn('[Reasoner returned unknown scene ids]', {
                    storyId,
                    returned: usedSceneIds.length,
                    kept: usedSceneIdsParsed.length,
                });
            }

            return { status: 'answered', answer, usedSceneIds: usedSceneIdsParsed, scenes };
        } catch (error) {
            if (error instanceof LLMUnavailableError) {
                logger.warn('[Reasoning degraded]', { storyId, sceneCount: relevantScenes.length });

                return {
                    status: 'reasoning_unavailable',
                    answer: null,
                    usedSceneIds: [],
                    scenes: relevantScenes,
                };
            }

            throw error;
        }
    }
}
