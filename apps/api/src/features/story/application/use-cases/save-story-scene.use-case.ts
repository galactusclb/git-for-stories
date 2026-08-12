import { Story } from '../../domain/entities/story';
import { StoryRepository } from '../ports/story-repository.port';

export class SaveStoryScenesUseCase {
    constructor(private readonly storyRepository: StoryRepository) {}

    async execute(story: Story) {
        await this.storyRepository.save(story);
    }
}
