import { Embedding } from '../../domain/entities/embedding';
import { SceneSearchResult } from '../../domain/entities/scene-search-result';

export interface EmbeddingRespository {
    save(sceneId: string, embedding: Embedding, embeddingModel: string): Promise<void>;

    searchSimilarScenes(
        storyId: string,
        queryEmbedding: Embedding,
        limit: number
    ): Promise<SceneSearchResult[]>;
}
