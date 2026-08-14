import { randomUUID } from 'node:crypto';

import prisma from '@/lib/prisma/prisma';

import { EmbeddingRespository } from '../../../application/ports/embedding-repository.port';
import { Embedding } from '../../../domain/entities/embedding';
import { SceneSearchResult } from '../../../domain/entities/scene-search-result';

export class PostgresEmbeddingRepository implements EmbeddingRespository {
    constructor() {}

    async save(sceneId: string, embedding: Embedding, embeddingModel: string): Promise<void> {
        const vector = `[${embedding.values.join(',')}]`;

        await prisma.$executeRaw`
            INSERT INTO "SceneEmbedding" ("id", "sceneId", embedding, model) VALUES (${randomUUID()}, ${sceneId}, ${vector}::vector, ${embeddingModel})
        `;
    }

    async searchSimilarScenes(
        storyId: string,
        queryEmbedding: Embedding,
        limit: number
    ): Promise<SceneSearchResult[]> {
        const vector = `[${queryEmbedding.values.join(',')}]`;

        const response = await prisma.$queryRaw<SceneSearchResult[]>`
            SELECT
                s."id"          AS "sceneId",
                s."sequenceId"  AS "sequenceId",
                s."title"       AS "title",
                s."summary"     AS "summary",
                1 - (se."embedding" <=> ${vector}::vector) AS "similarity"
            FROM "SceneEmbedding" se
            JOIN "Scene" s
                ON s.id = se."sceneId"
            WHERE s."storyId" = ${storyId}
            ORDER BY se."embedding" <=> ${vector}::vector
            LIMIT ${limit}
        `;
        // AND se.model = ${embeddingModel}

        console.log('searchSimilarScenes response', response);

        return response;
    }
}
