import { logger } from '@/lib/logger';
import { LLMUnavailableError } from '@/utils/errors/http-error';

import { GenerateParams, LLMProvider } from '../interfaces/llm-provider.interface';

export class RetryLLmProvider implements LLMProvider {
    constructor(
        private readonly inner: LLMProvider,
        private readonly maxAttempts = 3,
        private readonly baseDelayMs = 400
    ) {}

    async generateText(params: GenerateParams): Promise<string> {
        let lastError: unknown;

        for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
            try {
                return await this.inner.generateText(params);
            } catch (error) {
                lastError = error;

                if (!(error instanceof LLMUnavailableError) || attempt === this.maxAttempts)
                    throw error;

                const delay = Math.random() * this.baseDelayMs * 2 ** (attempt - 1);
                logger.warn('[LLM retry]', { attempt, delay });
                await new Promise((r) => setTimeout(r, delay));
            }
        }

        throw lastError;
    }
}
