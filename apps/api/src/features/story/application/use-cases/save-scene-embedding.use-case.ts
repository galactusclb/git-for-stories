import { Embedding } from '../../domain/entities/embedding';
import { EmbeddingRespository } from '../ports/embedding-repository.port';

export class SaveSceneEmbeddingUseCase {
    constructor(private readonly embeddingRepository: EmbeddingRespository) {}

    async execute(sceneId: string, embedding: Embedding, embeddingModel: string): Promise<void> {
        await this.embeddingRepository.save(sceneId, embedding, embeddingModel);
        console.log('done');
    }
}
