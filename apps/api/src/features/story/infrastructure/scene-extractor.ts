import { randomUUID } from 'node:crypto';

import z from 'zod';

import { LLMProvider } from '@/lib/llm/llm-provider.interface';
import { LLMProviderError } from '@/utils/errors/http-error';

import { SceneExtractor } from '../application/ports/scene-extractor.port';
import { Scene } from '../domain/entities/scene';

const prompt = `
You are a story analysis assistant. First identify the distinct scenes in the story.

A scene represents a meaningful unit of narrative action,
typically involving a change in location, time, characters,
situation, or major action or some objects belong to someone.

Do not merge multiple distinct scenes into one scene.

For every identified scene, extract:
1. sequence_id
2. title
3. summary
4. characters
5. location
6. events

For each event, identify the important action or state change.

Use concise, consistent, action-oriented event types such as:
ARRIVES, LEAVES, MEETS, NOTICES, DISCOVERS, REVEALS,
LEARNS, LOSES, GAINS, ATTACKS, KILLS, DIES, PROMISES, etc.

You are not restricted to these examples. If necessary,
create an appropriate event type.

Only extract events supported by the story.
Do not invent events.
            `;

const EventExtractionSchema = z.object({
    type: z.string(),
    description: z.string(),
    subject: z.string(),
    object: z.string().optional(),
});

const ExtractionResponseSchema = z.object({
    scenes: z.array(
        z.object({
            sequence_id: z.number(),
            title: z.string(),
            summary: z.string(),

            characters: z.array(z.string()),
            location: z.string().optional(),

            events: z.array(EventExtractionSchema),
        })
    ),
});

export class LLMSceneExtractor implements SceneExtractor {
    constructor(private readonly provider: LLMProvider) {}

    async extract(story: string): Promise<Scene[]> {
        const response = await this.provider.generate({
            instructions: prompt,
            input: story,
            responseSchema: z.toJSONSchema(ExtractionResponseSchema, { target: 'openapi-3.0' }),
        });

        const result = ExtractionResponseSchema.safeParse(JSON.parse(response));

        if (!result.success) {
            throw new LLMProviderError('Failed to extract valid scenes', result.error);
        }

        return result.data.scenes.map((scene) => ({
            ...scene,
            id: randomUUID(),
            events: scene.events.map((event) => ({
                ...event,
                id: randomUUID(),
            })),
        }));
    }
}
