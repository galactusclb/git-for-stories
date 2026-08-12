export interface GenerateProps {
    input: string;
}

export interface EmbeddingVectorResponse {
    values: number[];
}

export interface EmbeddingProvider {
    generateEmbedding(params: GenerateProps): Promise<EmbeddingVectorResponse[]>;
}
