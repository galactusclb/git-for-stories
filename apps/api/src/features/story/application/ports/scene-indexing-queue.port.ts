export interface SceneIndexingRequest {
    storyId: string;
    embeddingModel: string;
}

export interface SceneIndexingQueue {
    requestIndexing(request: SceneIndexingRequest): Promise<void>;
}
