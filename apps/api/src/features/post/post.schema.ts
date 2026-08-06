import { z } from 'zod';

import { paginationSchema, sortSchema } from '@/schemas/pagination.schema';
import { basePostSchema, postResponseSchema } from '@/schemas/post.schema';

export type { Post } from '@/schemas/post.schema';

export const postFilterSchema = paginationSchema.merge(sortSchema).extend({
    published: z
        .enum(['true', 'false'])
        .transform((v) => v === 'true')
        .optional(),
});

const postIdParams = postResponseSchema.pick({id: true});

export const createPostSchema = { body: basePostSchema };
export const getPostsSchema = { query: postFilterSchema };
export const getPostByIdSchema = { params: postIdParams };
export const updatePostSchema = { body: basePostSchema.partial(), params: postIdParams };
export const deletePostSchema = { params: postIdParams };

export type CreatePostInput = z.infer<typeof createPostSchema.body>;
export type UpdatePostInput = z.infer<typeof updatePostSchema.body>;
export type PostIdParam = z.infer<typeof getPostByIdSchema.params>;
export type ListPostsQuery = z.infer<typeof postFilterSchema>;