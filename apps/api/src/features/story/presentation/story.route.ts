import { Router } from 'express';

import { validate } from '@/middleware/validate.middleware';

import { StoryController } from './story.controller';
import { extractScenesSchema, sementicSearchSchema } from './story.schema';

export const createStoryRouter = (controller: StoryController) => {
    const router = Router();

    router.post('/scenes', validate(extractScenesSchema), controller.extractScenes);
    router.get('/search/:storyId', validate(sementicSearchSchema), controller.sementicSearch);

    return router;
};
