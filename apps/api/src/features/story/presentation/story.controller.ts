import { randomUUID } from 'node:crypto';

import { Request, Response } from 'express';

import { CreateSceneEmbeddingUseCase } from '../application/use-cases/create-scene-embedding.use-case';
import { CreateSceneSementicSearchUseCase } from '../application/use-cases/create-scene-sementic-search-embedding.use-case';
import { ExtractStoryScenesUseCase } from '../application/use-cases/extract-story-scenes.use-case';
import { SaveSceneEmbeddingUseCase } from '../application/use-cases/save-scene-embedding.use-case';
import { SaveStoryScenesUseCase } from '../application/use-cases/save-story-scene.use-case';
import { SceneSimiliratySearchUseCase } from '../application/use-cases/scene-similiraty-search.use-case';

import { SementicSearchParams, SementicSearchQuery } from './story.schema';

export class StoryController {
    constructor(
        private readonly extractStoryScenes: ExtractStoryScenesUseCase,
        private readonly saveStoryScene: SaveStoryScenesUseCase,
        private readonly createSceneEmbedding: CreateSceneEmbeddingUseCase,
        private readonly saveSceneEmbeddingUseCase: SaveSceneEmbeddingUseCase,
        private readonly createSceneSementicSearchUseCase: CreateSceneSementicSearchUseCase,
        private readonly sceneSimiliratySearchUseCase: SceneSimiliratySearchUseCase
    ) {}

    extractScenes = async (req: Request, res: Response) => {
        const { story, title } = req.body;

        const scenes = await this.extractStoryScenes.execute(story);

        await this.saveStoryScene.execute({
            id: randomUUID(),
            title,
            scenes,
        });

        // async background logc temporally without await;
        // later refactor to somekind of background process
        const embedding = await this.createSceneEmbedding.execute(scenes);
        console.log('embedding', embedding);

        this.saveSceneEmbeddingUseCase.execute(scenes[0].id, embedding[0], 'gemini-embedding-2');

        res.json({
            title,
            scenes,
        });
    };

    sementicSearch = async (req: Request, res: Response) => {
        const { storyId } = req.validatedParams as SementicSearchParams;
        const { q } = req.validatedQuery as SementicSearchQuery;
        console.log('q', q);

        const embedding = await this.createSceneSementicSearchUseCase.generateEmbedding(q);
        console.log('got embedding', embedding);

        const response = await this.sceneSimiliratySearchUseCase.search(storyId, embedding[0]);
        console.log('response', response);

        res.status(200).json({
            message: 'success',
        });
    };
}
