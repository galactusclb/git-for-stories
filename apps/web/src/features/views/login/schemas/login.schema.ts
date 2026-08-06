import { z } from 'zod';

import { returnToSchema } from '@/utils';

export const loginSearchParamsSchema = z.object({
    returnTo: returnToSchema,
});

export type LoginSearchParams = z.infer<typeof loginSearchParamsSchema>;
