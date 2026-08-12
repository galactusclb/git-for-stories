import { Story } from '../../domain/entities/story';

export interface StoryRepository {
    save(story: Story): Promise<void>;
}
