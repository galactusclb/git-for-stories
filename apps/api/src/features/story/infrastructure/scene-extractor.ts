import { randomUUID } from 'node:crypto';

import z from 'zod';

import { LLMProvider } from '@/lib/llm/llm-provider.interface';

import { SceneExtractor } from '../application/ports/scene-extractor.port';
import { Scene } from '../domain/entities/scene';

const prompt = `
                You are a story analysis assistant.

                Extract the scenes from the provided story.

                Return the result as JSON.
            `;

const ExtractionResponseSchema = z.object({
    scenes: z.array(
        z.object({
            sequence: z.number(),
            title: z.string(),
            summary: z.string(),
            characters: z.array(z.string()),
            location: z.string().optional(),
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

        const { scenes } = ExtractionResponseSchema.parse(JSON.parse(response));

        return scenes.map((scene) => ({ id: randomUUID(), ...scene }));
    }
}
