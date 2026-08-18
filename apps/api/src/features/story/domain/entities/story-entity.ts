export type EntityKind = 'CHARACTER' | 'OBJECT' | 'LOCATION' | 'FACTION';

export interface StoryEntity {
    id: string;
    kind: EntityKind;
    name: string;
    aliases: string[];
}

export interface EntityMention {
    text: string;
    kindHint?: EntityKind;
}

export function normalizeMention(text: string): string {
    return text.trim().toLowerCase();
}
