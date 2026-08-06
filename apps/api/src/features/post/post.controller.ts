import { Request, Response } from 'express';

import { logger } from '@/lib/logger/index.ts';
import { requireAuth } from '@/middleware/auth.middleware.ts';

import { CreatePostInput, ListPostsQuery, UpdatePostInput, PostIdParam } from './post.schema.ts';
import {
    createNewPost,
    deleteExistingPost,
    getPost,
    listPosts,
    updateExistingPost,
} from './post.service.ts';

const list = async (req: Request, res: Response) => {
    logger.info('check');
    const query = req.validatedQuery as ListPostsQuery;
    const result = await listPosts(query);
    res.status(200).json({ success: true, ...result });
};

const getOne = async (req: Request, res: Response) => {
    const { id } = req.validatedParams as PostIdParam;
    const post = await getPost(id);
    res.status(200).json({ success: true, data: post });
};

const create = async (req: Request, res: Response) => {
    const user = requireAuth(req);
    const input = req.validatedBody as CreatePostInput;
    const post = await createNewPost(input, user.id);
    res.status(201).json({ success: true, data: post });
};

const update = async (req: Request, res: Response) => {
    const user = requireAuth(req);
    const { id } = req.validatedParams as PostIdParam;
    const input = req.validatedBody as UpdatePostInput;
    const post = await updateExistingPost(id, input, user.id, user.role);
    res.status(200).json({ success: true, data: post });
};

const remove = async (req: Request, res: Response) => {
    const user = requireAuth(req);
    const { id } = req.validatedParams as PostIdParam;
    await deleteExistingPost(id, user.id, user.role);
    res.status(204).send();
};

export default { list, getOne, create, update, remove };
