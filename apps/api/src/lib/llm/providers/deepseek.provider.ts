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
            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: `${instructions}\n\nRespond only with JSON matching this schema:\n${JSON.stringify(responseSchema)}`,
                    },
                    { role: 'user', content: input },
                ],
                response_format: { type: 'json_object' },
            });

            const content = response.choices[0]?.message?.content;

            if (!content) {
                throw new Error('Agent returned an empty response');
            }

            return content;
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
