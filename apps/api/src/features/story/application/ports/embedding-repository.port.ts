import { Embedding } from '../../domain/entities/embedding';
import { SceneSearchResult } from '../../domain/entities/scene-search-result';
import { SceneEmbedding } from '../use-cases/create-scene-embedding.use-case';

export interface EmbeddingRespository {
    saveMany(sceneEmbeddings: SceneEmbedding[], embeddingModel: string): Promise<void>;

    searchSimilarScenes(
        storyId: string,
        queryEmbedding: Embedding,
        limit: number,
        embeddingModel: string
    ): Promise<SceneSearchResult[]>;
}
