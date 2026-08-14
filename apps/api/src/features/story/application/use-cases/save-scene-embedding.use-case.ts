import { EmbeddingRespository } from '../ports/embedding-repository.port';

import { SceneEmbedding } from './create-scene-embedding.use-case';

export class SaveSceneEmbeddingUseCase {
    constructor(private readonly embeddingRepository: EmbeddingRespository) {}

    async execute(sceneEmbeddings: SceneEmbedding[], embeddingModel: string): Promise<void> {
        await this.embeddingRepository.saveMany(sceneEmbeddings, embeddingModel);
        console.log('done');
    }
}
