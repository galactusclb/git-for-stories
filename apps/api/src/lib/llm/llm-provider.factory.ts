import { EmbeddingProvider } from './embedding-provider.interface';
import { LLMProvider } from './llm-provider.interface';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAIProvider } from './providers/openai.provider';

const LLM_OPENAI_API_KEY = process.env.LLM_OPENAI_API_KEY;
const LLM_GEMINI_API_KEY = process.env.LLM_GEMINI_API_KEY;

type LLMProviderName = 'openai' | 'gemini';
type EmbeddingProviderName = 'openai' | 'gemini';
export function createLLMProvider(name: LLMProviderName): LLMProvider {
    switch (name) {
        case 'openai':
            return new OpenAIProvider(LLM_OPENAI_API_KEY!, 'gpt-4.1-nano');

        case 'gemini':
            return new GeminiProvider(LLM_GEMINI_API_KEY!, 'gemini-flash-latest');

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
