import z from 'zod';

import { apiResponseSchema } from '@/models/api-response.schema';

export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

export const userResponseSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    role: z.nativeEnum(UserRole),
    createdAt: z.string(),
});

export const meFullResponseSchema = apiResponseSchema.single(userResponseSchema);

export const logoutResponseSchema = apiResponseSchema.single(z.void());

export type User = z.infer<typeof userResponseSchema>;
export type MeFullResponse = z.infer<typeof meFullResponseSchema>;
