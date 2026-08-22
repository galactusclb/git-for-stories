import { Scene } from '../../domain/entities/scene';

export interface StoryGraphRepository {
    upsertStoryGraph(storyId: string, scenes: Scene[]): Promise<void>;
}
