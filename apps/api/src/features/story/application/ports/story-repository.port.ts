import { Scene } from '../../domain/entities/scene';
import { Story } from '../../domain/entities/story';

export interface StoryRepository {
    save(story: Story): Promise<void>;
    findScenesByStory(storyId: string): Promise<Scene[]>;
}
