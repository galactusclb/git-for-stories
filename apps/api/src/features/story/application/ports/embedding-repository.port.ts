import { Embedding } from '../../domain/entities/embedding';
import { SceneEmbedding } from '../../domain/entities/scene-embedding';
import { SceneSearchResult } from '../../domain/entities/scene-search-result';

export interface EmbeddingRespository {
    saveMany(sceneEmbeddings: SceneEmbedding[], embeddingModel: string): Promise<void>;

    searchSimilarScenes(
        storyId: string,
        queryEmbedding: Embedding,
        limit: number,
        embeddingModel: string,
    ): Promise<SceneSearchResult[]>;
}
