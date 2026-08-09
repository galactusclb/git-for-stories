import { GoogleGenAI } from '@google/genai';

import { GenerateParams, LLMProvider } from '../llm-provider.interface';

export class GeminiProvider implements LLMProvider {
    private client: GoogleGenAI;

    constructor(
        private apiKey: string,
        private model: string
    ) {
        this.client = new GoogleGenAI({
            apiKey: this.apiKey,
        });
    }

    async generate({ input, instructions, responseSchema }: GenerateParams): Promise<string> {
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

        console.log(response.text);

        return response.text;
    }
}
