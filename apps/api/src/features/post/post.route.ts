import { Router } from 'express';

import { isAuth, optionalAuth } from '@/middleware/auth.middleware.ts';
import { validate } from '@/middleware/validate.middleware.ts';

import postCtrl from './post.controller.ts';
import {
    createPostSchema,
    deletePostSchema,
    getPostByIdSchema,
    getPostsSchema,
    updatePostSchema,
} from './post.schema.ts';

const router = Router();

router.get('/', validate(getPostsSchema), optionalAuth, postCtrl.list);
router.get('/:id', validate(getPostByIdSchema), optionalAuth, postCtrl.getOne);
router.post('/', isAuth, validate(createPostSchema), postCtrl.create);
router.patch(
    '/:id',
    isAuth,
    validate(updatePostSchema),
    postCtrl.update
);
router.delete('/:id', isAuth, validate(deletePostSchema), postCtrl.remove);

export default router;
