import { EmbeddingProvider } from './interfaces/embedding-provider.interface';
import { LLMProvider } from './interfaces/llm-provider.interface';
import { DeepSeekProvider } from './providers/deepseek.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { RetryLLmProvider } from './providers/retrying-llm.provider';

const LLM_OPENAI_API_KEY = process.env.LLM_OPENAI_API_KEY;
const LLM_GEMINI_API_KEY = process.env.LLM_GEMINI_API_KEY;
const LLM_DEEPSEEK_API_KEY = process.env.LLM_DEEPSEEK_API_KEY;

type LLMProviderName = 'openai' | 'gemini' | 'deepseek';
type EmbeddingProviderName = 'openai' | 'gemini';

export function createLLMProvider(name: LLMProviderName): LLMProvider {
    switch (name) {
        case 'openai':
            return new OpenAIProvider(LLM_OPENAI_API_KEY!, 'gpt-4.1-nano');

        case 'gemini':
            return new RetryLLmProvider(
                new GeminiProvider(LLM_GEMINI_API_KEY!, 'gemini-flash-latest')
            );

        case 'deepseek':
            return new RetryLLmProvider(
                new DeepSeekProvider(LLM_DEEPSEEK_API_KEY!, 'deepseek-v4-flash')
            );

        default:
            throw new Error(`Unkown LLM provider: ${name}`);
    }
}

export function createEmbeddingProvider(name: EmbeddingProviderName): EmbeddingProvider {
    switch (name) {
        case 'openai':
            return new OpenAIProvider(LLM_OPENAI_API_KEY!, 'text-embedding-ada-002');
        case 'gemini':
            return new GeminiProvider(LLM_GEMINI_API_KEY!, 'gemini-embedding-2');
        default:
            throw new Error(`Unknown embedding provider: ${name}`);
    }
}
