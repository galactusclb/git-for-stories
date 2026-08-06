import { cookies } from 'next/headers';

import { postListResponseSchema } from '@/models/post.schema';
import { apiServer } from '@/utils/api/api-server';

import { userQueries } from '../queries';

export const fetchMyPostsServer = async () => {
    const cookieStore = await cookies();
    if (!cookieStore.has('refresh_token')) return [];

    const response = await apiServer(userQueries.myPosts.endpoint, postListResponseSchema, {}, true);
    return response.success ? response.data : [];
};
