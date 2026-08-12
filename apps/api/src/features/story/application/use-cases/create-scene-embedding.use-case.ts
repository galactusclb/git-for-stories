import { Embedding } from '../../domain/entities/embedding';
import { Scene } from '../../domain/entities/scene';
import { EmbeddingGenerator } from '../ports/embedding-generator.port';

export class CreateSceneEmbeddingUseCase {
    constructor(private readonly embeddingGenerator: EmbeddingGenerator) {}

    async execute(input: Scene[]): Promise<Embedding[]> {
        // Need to create embedding for each scene. But for now, only create one
        const parsedScene = `
            ${input?.[0]['title']}

            ${input?.[0]['summary']}

            Events:
            ${input?.[0]?.events?.map((event) => `${event.description} \n`)}
        `;

        console.log('parsedScene');
        console.log(parsedScene);

        const res = await this.embeddingGenerator.generate(parsedScene);
        console.log('res embeddingGenerator', res);

        return res;
    }
}
