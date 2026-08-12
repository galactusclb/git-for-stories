import { logger } from '@/lib/logger';
import prisma from '@/lib/prisma/prisma';

import { StoryRepository } from '../../../application/ports/story-repository.port';
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
                    }))
                ),
            }),
        ]);
    }
}
