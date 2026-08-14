import { LLMProviderError } from '@/utils/errors/http-error';

import { Embedding } from '../../domain/entities/embedding';
import { Scene } from '../../domain/entities/scene';
import { EmbeddingGenerator } from '../ports/embedding-generator.port';

export interface SceneEmbedding {
    sceneId: string;
    embedding: Embedding;
}
export class CreateSceneEmbeddingUseCase {
    constructor(private readonly embeddingGenerator: EmbeddingGenerator) {}

    async execute(scenes: Scene[]): Promise<SceneEmbedding[]> {
        if (scenes.length === 0) {
            return [];
        }

        const embeddings = await this.embeddingGenerator.generate(scenes.map(toEmbeddingInput));

        if (embeddings.length !== scenes.length) {
            throw new LLMProviderError(
                `Embedding count mismatch: expected ${scenes.length}, received ${embeddings.length}`
            );
        }

        return scenes.map((scene, index) => ({
            sceneId: scene.id,
            embedding: embeddings[index],
        }));
    }
}

function toEmbeddingInput(scene: Scene): string {
    const events = scene.events?.map((event) => event.description).join('\n');

    return [scene.title, scene.summary, events && `Events: \n${events}`]
        .filter(Boolean)
        .join('\n\n');
}
