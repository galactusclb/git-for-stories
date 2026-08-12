export interface GenerateParams {
    instructions: string;
    input: string;
    responseSchema: Record<string, unknown>;
}

export interface LLMProvider {
    generateText(params: GenerateParams): Promise<string>;
}
