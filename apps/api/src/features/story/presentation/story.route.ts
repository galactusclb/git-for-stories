import { Router } from 'express';

import { StoryController } from './story.controller';

export const createStoryRouter = (controller: StoryController) => {
    const router = Router();

    router.post('/scenes', controller.extractScenes);

    return router;
};
