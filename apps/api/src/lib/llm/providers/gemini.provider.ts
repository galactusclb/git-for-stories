import { GoogleGenAI } from '@google/genai';

import { Generate, LLMProvider } from '../llm-provider.interface';

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

    async generate({ input, instructions }: Generate): Promise<string> {
        const response = await this.client.models.generateContent({
            model: this.model,
            contents: input,
            config: { systemInstruction: instructions },
        });

        if (!response.text) {
            throw new Error('Gemini returned an empty response');
        }

        console.log(response.text);

        return response.text;
    }
}
