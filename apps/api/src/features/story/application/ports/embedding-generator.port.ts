import { Embedding } from '../../domain/entities/embedding';

export interface EmbeddingGenerator {
    generate(input: string[]): Promise<Embedding[]>;
}
