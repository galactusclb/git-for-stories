import { EmbeddingProvider } from '@/lib/llm/interfaces/embedding-provider.interface';

import { EmbeddingGenerator } from '../../application/ports/embedding-generator.port';
import { Embedding } from '../../domain/entities/embedding';

export class LLMEmbeddingGenerator implements EmbeddingGenerator {
    constructor(private readonly provider: EmbeddingProvider) {}

    async generate(input: string): Promise<Embedding[]> {
        const embeddings = await this.provider.generateEmbedding({
            input: input,
        });

        return embeddings.map((item) => ({ values: item.values }));
    }
}
