export interface GenerateParams {
    instructions: string;
    input: string;
    responseSchema: Record<string, unknown>;
}

export interface LLMProvider {
    generate(params: GenerateParams): Promise<string>;
}
