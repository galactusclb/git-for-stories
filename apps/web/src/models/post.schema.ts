import z from 'zod';

import { apiResponseSchema } from '@/models/api-response.schema';

export const postSchema = z.object({
    id: z.string(),
    title: z.string(),
    body: z.string(),
    coverImageUrl: z.string().nullable().optional(),
    published: z.boolean(),
    authorId: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export const postListResponseSchema = apiResponseSchema.list(postSchema);
export const postSingleResponseSchema = apiResponseSchema.single(postSchema);

export type Post = z.infer<typeof postSchema>;
export type PostListResponse = z.infer<typeof postListResponseSchema>;
export type PostSingleResponse = z.infer<typeof postSingleResponseSchema>;
