import { Request, Response } from 'express';

import { ExtractStoryScenesUseCase } from '../application/use-cases/extract-story-scenes.use-case';

export class StoryController {
    constructor(private readonly extractStoryScenes: ExtractStoryScenesUseCase) {}

    extractScenes = async (req: Request, res: Response) => {
        const { story } = req.body;

        const scenes = await this.extractStoryScenes.execute(story);

        res.json({
            scenes,
        });
    };
}
