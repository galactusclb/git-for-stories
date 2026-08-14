import { z } from 'zod';

export const extractScenesSchema = {
    body: z.object({
        title: z.string().min(1).max(255),
        story: z.string().min(1),
    }),
};

export const sementicSearchSchema = {
    params: z.object({
        storyId: z.uuid(),
    }),
    query: z.object({
        q: z.string().min(1).max(500),
        limit: z.coerce.number().int().min(1).max(10).default(5),
    }),
};

export type ExtractScenesBody = z.infer<typeof extractScenesSchema.body>;
export type SementicSearchParams = z.infer<typeof sementicSearchSchema.params>;
export type SementicSearchQuery = z.infer<typeof sementicSearchSchema.query>;
