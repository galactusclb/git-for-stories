import OpenAI from 'openai';

import {
    EmbeddingProvider,
    EmbeddingVectorResponse,
    GenerateProps,
} from '../interfaces/embedding-provider.interface';
import { GenerateParams, LLMProvider } from '../interfaces/llm-provider.interface';

export class OpenAIProvider implements LLMProvider, EmbeddingProvider {
    private client: OpenAI;

    constructor(
        private apiKey: string,
        private model: string
    ) {
        this.client = new OpenAI({
            apiKey: this.apiKey,
        });
    }

    async generateText({ input, instructions, responseSchema }: GenerateParams): Promise<string> {
        const response = await this.client.responses.create({
            model: this.model,
            instructions,
            input,
            text: {
                format: {
                    type: 'json_schema',
                    name: 'response',
                    schema: responseSchema,
                    strict: true,
                },
            },
        });

        if (!response.output_text) {
            throw new Error('Agent returned an empty response');
        }

        console.log(response.text);

        return response.output_text;
    }

    async generateEmbedding({ input }: GenerateProps): Promise<EmbeddingVectorResponse[]> {
        const response = await this.client.embeddings.create({
            model: this.model,
            input,
            user: 'test-user',
        });

        return response.data?.map((item) => ({
            values: item.embedding ?? [],
        }));
    }
}
