import OpenAI from 'openai';

import { Generate, LLMProvider } from '../llm-provider.interface';

export class OpenAIProvider implements LLMProvider {
    private client: OpenAI;

    constructor(
        private apiKey: string,
        private model: string
    ) {
        this.client = new OpenAI({
            apiKey: this.apiKey,
        });
    }

    async generate({ input, instructions }: Generate): Promise<string> {
        const response = await this.client.responses.create({
            model: this.model,
            instructions,
            input,
        });

        return response.output_text;
    }
}
