import z from 'zod';

import { LLMProvider } from '@/lib/llm/interfaces/llm-provider.interface';
import { LLMProviderError } from '@/utils/errors/http-error';

import { SceneAnswer, SceneReasoner } from '../../application/ports/scene-reasoner.port';
import { SceneSearchResult } from '../../domain/entities/scene-search-result';

const instructions = `
You are a story analysis assistant. Answer the reader's question using only
the scenes provided.

The scenes are the passages most semantically similar to the question,
ordered from most to least similar. Not all of them are necessarily relevant.

Only use facts stated in the provided scenes. Do not invent events.
If the scenes do not contain the answer, say so plainly.
Report which scenes you relied on by their sceneId.
`;

const ReasoningResponseSchema = z.object({
    answer: z.string(),
    usedSceneIds: z.array(z.string()),
});

export class LLMSceneReasoner implements SceneReasoner {
    constructor(private readonly provider: LLMProvider) {}

    async reason(question: string, scenes: SceneSearchResult[]): Promise<SceneAnswer> {
        const input = `
            Question: ${question}
            
            Scenes: ${JSON.stringify(scenes, null, 2)}
        `;

        const response = await this.provider.generateText({
            instructions,
            input,
            responseSchema: z.toJSONSchema(ReasoningResponseSchema, { target: 'openapi-3.0' }),
        });

        const result = ReasoningResponseSchema.safeParse(JSON.parse(response));

        if (!result.success) {
            throw new LLMProviderError('Failed to reason over scenes', result.error);
        }

        return result.data;
    }
}
