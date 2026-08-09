export interface Generate {
    instructions: string;
    input: string;
}

export interface LLMProvider {
    generate(params: Generate): Promise<string>;
}
