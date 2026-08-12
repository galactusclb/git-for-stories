import { randomUUID } from 'node:crypto';

import { Request, Response } from 'express';

import { ExtractStoryScenesUseCase } from '../application/use-cases/extract-story-scenes.use-case';
import { SaveStoryScenesUseCase } from '../application/use-cases/save-story-scene.use-case';

export class StoryController {
    constructor(
        private readonly extractStoryScenes: ExtractStoryScenesUseCase,
        private readonly saveStoryScene: SaveStoryScenesUseCase
    ) {}

    extractScenes = async (req: Request, res: Response) => {
        const { story, title } = req.body;

        const scenes = await this.extractStoryScenes.execute(story);

        await this.saveStoryScene.execute({
            id: randomUUID(),
            title,
            scenes,
        });

        res.json({
            title,
            scenes,
        });
    };
}
