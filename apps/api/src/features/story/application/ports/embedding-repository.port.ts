import { Embedding } from '../../domain/entities/embedding';

export interface EmbeddingRespository {
    save(sceneId: string, embedding: Embedding, embeddingModel: string): Promise<void>;
}
