import { randomUUID } from 'node:crypto';

import prisma from '@/lib/prisma/prisma';

import { EmbeddingRespository } from '../../../application/ports/embedding-repository.port';
import { Embedding } from '../../../domain/entities/embedding';

export class PostgresEmbeddingRepository implements EmbeddingRespository {
    constructor() {}

    async save(sceneId: string, embedding: Embedding, embeddingModel: string): Promise<void> {
        const vector = `[${embedding.values.join(',')}]`;

        await prisma.$executeRaw`
            INSERT INTO "SceneEmbedding" ("id", "sceneId", embedding, model) VALUES (${randomUUID()}, ${sceneId}, ${vector}::vector, ${embeddingModel})
        `;
    }
}
