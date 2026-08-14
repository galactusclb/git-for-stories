import { GoogleGenAI } from '@google/genai';

import { HttpError, LLMProviderError, LLMUnavailableError } from '@/utils/errors/http-error';

import {
    GenerateProps as EmbeddingGenerateParams,
    EmbeddingProvider,
    EmbeddingVectorResponse,
} from '../interfaces/embedding-provider.interface';
import { GenerateParams, LLMProvider } from '../interfaces/llm-provider.interface';

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

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
        try {
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
        } catch (err) {
            if (err instanceof HttpError) throw err;
            throw toLLMError(err);
        }
    }

    async generateEmbedding({
        input,
    }: EmbeddingGenerateParams): Promise<EmbeddingVectorResponse[]> {
        const response = await this.client.models.embedContent({
            model: this.model,
            contents: input,
            config: {
                outputDimensionality: 1536,
            },
        });

        return (response.embeddings ?? [])?.map((item) => ({
            values: item.values ?? [],
        }));
    }
}

function toLLMError(err: unknown): Error {
    const status = (err as { status?: number })?.status;

    if (status && RETRYABLE_STATUS.has(status)) {
        return new LLMUnavailableError('Model is temporarily unavailable', { status });
    }
    if (status && status >= 400) {
        return new LLMProviderError('LLM request rejected', { status });
    }
    return new LLMProviderError('LLM call failed', {
        cause: err instanceof Error ? err.message : String(err),
    });
}
