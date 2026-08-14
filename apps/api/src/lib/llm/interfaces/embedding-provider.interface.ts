export interface GenerateProps {
    input: string | string[];
}

export interface EmbeddingVectorResponse {
    values: number[];
}

export interface EmbeddingProvider {
    generateEmbedding(params: GenerateProps): Promise<EmbeddingVectorResponse[]>;
}
