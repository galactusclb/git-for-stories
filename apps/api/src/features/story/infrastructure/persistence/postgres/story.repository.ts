import { logger } from '@/lib/logger';
import prisma from '@/lib/prisma/prisma';

import { StoryRepository } from '../../../application/ports/story-repository.port';
import { Scene } from '../../../domain/entities/scene';
import { Story } from '../../../domain/entities/story';

export class PostgresStoryRepository implements StoryRepository {
    async save(story: Story): Promise<void> {
        logger.info('save', { story });

        await prisma.$transaction([
            prisma.story.create({
                data: {
                    id: story.id,
                    title: story.title,
                    scenes: {
                        createMany: {
                            data: story.scenes.map((scene) => ({
                                id: scene.id,
                                sequenceId: scene.sequence_id,
                                summary: scene.summary,
                                title: scene.title,
                                location: scene.location,
                                characters: scene.characters,
                            })),
                        },
                    },
                },
            }),
            prisma.event.createMany({
                data: story.scenes.flatMap((scene) =>
                    scene.events.map((event) => ({
                        id: event.id,
                        sceneId: scene.id,
                        type: event.type,
                        description: event.description,
                        subject: event.subject,
                        object: event.object,
                    })),
                ),
            }),
        ]);
    }

    async findScenesByStory(storyId: string): Promise<Scene[]> {
        const rows = await prisma.scene.findMany({
            where: { storyId },
            include: { events: true },
            orderBy: { sequenceId: 'asc' },
        });

        return rows.map((row) => ({
            id: row.id,
            sequence_id: row.sequenceId,
            title: row.title,
            summary: row.summary,
            characters: row.characters,
            location: row.location ?? undefined,
            events: row.events.map((event) => ({
                id: event.id,
                type: event.type,
                description: event.description,
                subject: event.subject,
                object: event.object ?? undefined,
            })),
        }));
    }
}
