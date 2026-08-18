import { EntityMention, StoryEntity } from '../../domain/entities/story-entity';

export interface EntityResolver {
    resolve(mentions: EntityMention[]): Promise<ResolvedEntities>;
}

export interface ResolvedEntities {
    entities: StoryEntity[];
}
