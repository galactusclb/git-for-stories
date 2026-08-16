import { randomUUID } from 'node:crypto';

import { Prisma } from '@/lib/prisma/generated/client';
import prisma from '@/lib/prisma/prisma';

import { EmbeddingRespository } from '../../../application/ports/embedding-repository.port';
import { Embedding } from '../../../domain/entities/embedding';
import { SceneEmbedding } from '../../../domain/entities/scene-embedding';
import { SceneSearchResult } from '../../../domain/entities/scene-search-result';

export class PostgresEmbeddingRepository implements EmbeddingRespository {
    constructor() {}

    async saveMany(sceneEmbeddings: SceneEmbedding[], embeddingModel: string): Promise<void> {
        if (sceneEmbeddings.length === 0) {
            return;
        }

        const values = sceneEmbeddings.map(
            ({ sceneId, embedding }) =>
                Prisma.sql`(${randomUUID()}, ${sceneId}, ${`[${embedding.values.join(',')}]`}::vector, ${embeddingModel})`,
        );

        await prisma.$executeRaw`
            INSERT INTO "SceneEmbedding" ("id", "sceneId", embedding, model) 
            VALUES ${Prisma.join(values)}
            ON CONFLICT ("sceneId", "model")
            DO UPDATE SET embedding = EXCLUDED.embedding, "createdAt" = NOW();
        `;
    }

    async searchSimilarScenes(
        storyId: string,
        queryEmbedding: Embedding,
        limit: number,
        embeddingModel: string,
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
                AND se."model" = ${embeddingModel}
            ORDER BY se."embedding" <=> ${vector}::vector
            LIMIT ${limit}
        `;

        console.log('searchSimilarScenes response', response);

        return response;
    }
}
