import z from 'zod';

export const clientEnvSchema = z.object({
    NEXT_PUBLIC_API_BASE_URL: z.string().min(1, 'NEXT_PUBLIC_API_BASE_URL is required'),
});
