import z from 'zod';

import { trimmedString, normalizedEmail } from '@/lib/zod/extras';
import { Roles } from '@/prisma/client';

export const baseUserSchema = z.object({
    name: trimmedString
        .min(3)
        .max(30)
        .regex(/^[a-zA-Z0-9_]+$/, {
            message: 'Name can only contain letters, numbers, and underscores',
        }),
    email: normalizedEmail,
    pictureUrl: z.string().url().nullable(),
});

export const userSchema = baseUserSchema.extend({
    id: z.string().cuid(),
    emailVerified: z.boolean(),
    googleSub: z.string().nullable(),
    role: z.nativeEnum(Roles),
    lastLoginAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type User = z.infer<typeof userSchema>;
export type BaseUser = z.infer<typeof baseUserSchema>;
