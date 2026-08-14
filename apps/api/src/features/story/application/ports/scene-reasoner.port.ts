import { SceneSearchResult } from '../../domain/entities/scene-search-result';

export interface SceneAnswer {
    answer: string;
    usedSceneIds: string[];
}

export interface SceneReasoner {
    reason(question: string, scenes: SceneSearchResult[]): Promise<SceneAnswer>;
}
