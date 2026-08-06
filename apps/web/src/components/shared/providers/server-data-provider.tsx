import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { ReactNode } from 'react';

import { authQueries, fetchMeServer } from '@/features/auth/index.server';
import { fetchMyPostsServer, userQueries } from '@/features/user/index.server';

export default async function ServerDataProvider({ children }: { children: ReactNode }) {
    const queryClient = new QueryClient();

    await Promise.all([
        queryClient.prefetchQuery({ queryKey: authQueries.me.key(), queryFn: fetchMeServer }),
        queryClient.prefetchQuery({
            queryKey: userQueries.myPosts.key(),
            queryFn: fetchMyPostsServer,
        }),
    ]);

    return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
