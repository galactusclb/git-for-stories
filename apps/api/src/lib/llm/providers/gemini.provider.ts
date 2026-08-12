import { GoogleGenAI } from '@google/genai';

import {
    EmbeddingProvider,
    GenerateProps as EmbeddingGenerateParams,
    EmbeddingVectorResponse,
} from '../interfaces/embedding-provider.interface';
import { GenerateParams, LLMProvider } from '../interfaces/llm-provider.interface';

export class GeminiProvider implements LLMProvider, EmbeddingProvider {
    private client: GoogleGenAI;

    constructor(
        private apiKey: string,
        private model: string
    ) {
        this.client = new GoogleGenAI({
            apiKey: this.apiKey,
        });
    }

    async generateText({ input, instructions, responseSchema }: GenerateParams): Promise<string> {
        const response = await this.client.models.generateContent({
            model: this.model,
            contents: input,
            config: {
                systemInstruction: instructions,
                responseMimeType: 'application/json',
                responseSchema,
            },
        });

        if (!response.text) {
            throw new Error('Agent returned an empty response');
        }

        console.log(response.usageMetadata);
        console.log(response.usageMetadata?.cacheTokensDetails);
        console.log('cachedContentTokenCount', response.usageMetadata?.cachedContentTokenCount);

        return response.text;
    }

    async generateEmbedding({
        input,
    }: EmbeddingGenerateParams): Promise<EmbeddingVectorResponse[]> {
        const response = await this.client.models.embedContent({
            model: this.model,
            contents: input,
            config: {},
        });

        return (response.embeddings ?? [])?.map((item) => ({
            values: item.values ?? [],
        }));
    }
}
