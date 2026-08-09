import { Scene } from '../../domain/entities/scene';
import { SceneExtractor } from '../ports/scene-extractor.port';

export class ExtractStoryScenesUseCase {
    constructor(private readonly sceneExtractor: SceneExtractor) {}

    async execute(story: string): Promise<Scene[]> {
        if (!story.trim()) {
            throw new Error('Story cannot be empty');
        }

        return this.sceneExtractor.extract(story);
    }
}
