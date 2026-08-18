import { Scene } from './scene';
import { StoryEntity } from './story-entity';
export interface Story {
    id: string;
    title: string;
    entities: StoryEntity[];
    scenes: Scene[];
}
