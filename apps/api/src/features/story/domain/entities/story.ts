import { Scene } from './scene';

export interface Story {
    id: string;
    title: string;
    scenes: Scene[];
}
