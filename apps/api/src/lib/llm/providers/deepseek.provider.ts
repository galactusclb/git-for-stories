import OpenAI from 'openai';

import { HttpError, LLMProviderError, LLMUnavailableError } from '@/utils/errors/http-error';

import { GenerateParams, LLMProvider } from '../interfaces/llm-provider.interface';

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

export class DeepSeekProvider implements LLMProvider {
    private client: OpenAI;

    constructor(
        private apiKey: string,
        private model: string
    ) {
        this.client = new OpenAI({
            apiKey: this.apiKey,
            baseURL: 'https://api.deepseek.com',
        });
    }

    async generateText({ input, instructions, responseSchema }: GenerateParams): Promise<string> {
        try {
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

            return response.output_text;
        } catch (err) {
            if (err instanceof HttpError) throw err;
            throw toLLMError(err);
        }
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
