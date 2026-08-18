import { ExtractedScene } from '../entities/extracted-scene';
import { EntityMention, normalizeMention } from '../entities/story-entity';

export function collectMentions(scenes: ExtractedScene[]): EntityMention[] {
    const seenMap = new Map<string, EntityMention>();

    for (const scene of scenes) {
        scene.characters.forEach((character) => add(seenMap, character, 'CHARACTER'));
        add(seenMap, scene.location, 'LOCATION');
    }

    for (const scene of scenes) {
        for (const event of scene.events) {
            add(seenMap, event.subject);
            add(seenMap, event.object);
        }
    }

    return [...seenMap.values()];
}

function add(
    seenMap: Map<string, EntityMention>,
    text: string | undefined,
    kindHint?: EntityMention['kindHint'],
) {
    const value = text?.trim();
    if (!value) return;

    const key = normalizeMention(value);
    if (!seenMap.has(key)) seenMap.set(key, { text: value, kindHint });
}
