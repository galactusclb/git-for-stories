import { z } from 'zod';

export const returnToSchema = z
    .string()
    .refine((s) => s.startsWith('/') && !s.startsWith('//') && !s.startsWith('/\\'), {
        message: 'returnTo must be a same-origin path',
    });

export function parseReturnTo(value: string | null | undefined): string | null {
    if (!value) return null;
    const result = returnToSchema.safeParse(value);
    return result.success ? result.data : null;
}
