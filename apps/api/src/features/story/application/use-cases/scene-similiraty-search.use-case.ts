import { Embedding } from '../../domain/entities/embedding';
import { SceneSearchResult } from '../../domain/entities/scene-search-result';
import { EmbeddingRespository } from '../ports/embedding-repository.port';

export class SceneSimiliratySearchUseCase {
    constructor(private readonly embeddingRespository: EmbeddingRespository) {}

    async search(storyId: string, embedding: Embedding): Promise<SceneSearchResult[]> {
        return await this.embeddingRespository.searchSimilarScenes(storyId, embedding);
    }
}
