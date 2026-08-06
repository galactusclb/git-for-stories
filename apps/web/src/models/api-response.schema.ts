import z from 'zod';

export const apiErrorSchema = z.object({
    message: z.string(),
    code: z.string().optional(),
});

export const apiMetaSchema = z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
});

const failureSchema = z.object({
    success: z.literal(false),
    error: apiErrorSchema,
    data: z.never().optional(),
    meta: z.never().optional(),
    message: z.string().optional(),
});

export const apiResponseSchema = {
    single: <T extends z.ZodTypeAny>(dataSchema: T) =>
        z.discriminatedUnion('success', [
            z.object({
                success: z.literal(true),
                message: z.string().optional(),
                data: dataSchema,
                error: z.never().optional(),
            }),
            failureSchema,
        ]),

    list: <T extends z.ZodTypeAny>(itemSchema: T) =>
        z.discriminatedUnion('success', [
            z.object({
                success: z.literal(true),
                message: z.string().optional(),
                data: z.array(itemSchema),
                meta: apiMetaSchema,
                error: z.never().optional(),
            }),
            failureSchema,
        ]),
};

export type ApiError = z.infer<typeof apiErrorSchema>;
export type ApiMeta = z.infer<typeof apiMetaSchema>;
export type ApiResponse<T> = z.infer<ReturnType<typeof apiResponseSchema.single<z.ZodType<T>>>>;
