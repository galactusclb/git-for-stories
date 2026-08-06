import { cookies } from 'next/headers';

import { meFullResponseSchema } from '@/models/user.schema';
import { apiServer } from '@/utils/api/api-server';

import { authQueries } from '../queries';

export const fetchMeServer = async () => {
    const cookieStore = await cookies();
    if (!cookieStore.has('refresh_token')) return null;

    const response = await apiServer(authQueries.me.endpoint, meFullResponseSchema);
    return response.success ? response.data : null;
};
