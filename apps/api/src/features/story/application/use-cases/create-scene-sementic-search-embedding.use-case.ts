import { Embedding } from '../../domain/entities/embedding';
import { EmbeddingGenerator } from '../ports/embedding-generator.port';

export class CreateSceneSementicSearchUseCase {
    constructor(private readonly embeddingGenerator: EmbeddingGenerator) {}

    async generateEmbedding(input: string): Promise<Embedding[]> {
        return await this.embeddingGenerator.generate(input);
    }
}
