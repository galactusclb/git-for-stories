import { z } from 'zod';

export const basePostSchema = z.object({
    title: z.string().min(1).max(255),
    body: z.string().min(1),
    coverImageUrl: z.string().url().optional(),
    published: z.boolean().optional().default(false),
});

export const postResponseSchema = basePostSchema.extend({
    id: z.string().cuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Post = z.infer<typeof postResponseSchema>;
export type BasePost = z.infer<typeof basePostSchema>;
