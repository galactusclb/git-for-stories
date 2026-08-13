import { randomUUID } from 'node:crypto';

import { Request, Response } from 'express';

import { CreateSceneEmbeddingUseCase } from '../application/use-cases/create-scene-embedding.use-case';
import { ExtractStoryScenesUseCase } from '../application/use-cases/extract-story-scenes.use-case';
import { SaveSceneEmbeddingUseCase } from '../application/use-cases/save-scene-embedding.use-case';
import { SaveStoryScenesUseCase } from '../application/use-cases/save-story-scene.use-case';

export class StoryController {
    constructor(
        private readonly extractStoryScenes: ExtractStoryScenesUseCase,
        private readonly saveStoryScene: SaveStoryScenesUseCase,
        private readonly createSceneEmbedding: CreateSceneEmbeddingUseCase,
        private readonly saveSceneEmbeddingUseCase: SaveSceneEmbeddingUseCase
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
}
