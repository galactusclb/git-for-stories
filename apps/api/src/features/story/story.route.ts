import { Router } from 'express';

import storyCtrl from './story.controller';

const route = Router();

route.get('/', storyCtrl.getEmeddings);

export default route;
