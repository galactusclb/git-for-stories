import { z } from 'zod';

import { userSchema } from '@/schemas/user.schema';

export type { User } from '@/schemas/user.schema';

const passwordSchema = z.string().min(8).max(128);

export const credentialsSchema = userSchema.pick({ email: true }).extend({
    password: passwordSchema,
});

export const registerSchema = { body: credentialsSchema };
export const loginSchema = { body: credentialsSchema };

export type RegisterInput = z.infer<typeof credentialsSchema>;
export type LoginInput = z.infer<typeof credentialsSchema>;
