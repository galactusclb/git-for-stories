import { Scene } from '../entities/scene';

export function toEmbeddingInput(scene: Scene): string {
    const events = scene.events?.map((event) => event.description).join('\n');

    return [scene.title, scene.summary, events && `Events: \n${events}`]
        .filter(Boolean)
        .join('\n\n');
}
