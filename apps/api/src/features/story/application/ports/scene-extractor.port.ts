import { ExtractedScene } from '../../domain/entities/extracted-scene';
export interface SceneExtractor {
    extract(story: string): Promise<ExtractedScene[]>;
}
