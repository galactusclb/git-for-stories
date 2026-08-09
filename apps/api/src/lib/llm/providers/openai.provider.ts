import OpenAI from 'openai';

import { GenerateParams, LLMProvider } from '../llm-provider.interface';

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

    async generate({ input, instructions, responseSchema }: GenerateParams): Promise<string> {
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
}
