import { Scene } from '../../domain/entities/scene';

export interface SceneExtractor {
    extract(story: string): Promise<Scene[]>;
}
