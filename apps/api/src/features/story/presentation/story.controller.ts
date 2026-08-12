import { randomUUID } from 'node:crypto';

import { Request, Response } from 'express';

import { CreateSceneEmbeddingUseCase } from '../application/use-cases/create-scene-embedding.use-case';
import { ExtractStoryScenesUseCase } from '../application/use-cases/extract-story-scenes.use-case';
import { SaveStoryScenesUseCase } from '../application/use-cases/save-story-scene.use-case';

export class StoryController {
    constructor(
        private readonly extractStoryScenes: ExtractStoryScenesUseCase,
        private readonly saveStoryScene: SaveStoryScenesUseCase,
        private readonly createSceneEmbedding: CreateSceneEmbeddingUseCase
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
        this.createSceneEmbedding.execute(scenes);

        res.json({
            title,
            scenes,
        });
    };
}
