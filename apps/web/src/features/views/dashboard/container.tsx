import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { fetchMyPostsServer } from '@/features/user/index.server';

import PostList from './components/post-list';

export default async function DashboardContainer() {
    const posts = await fetchMyPostsServer();

    return (
        <div className="flex flex-col gap-8 w-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">My Posts</h1>
                    <p className="mt-1 text-muted-foreground text-sm">
                        {posts.length} post{posts.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <Button asChild>
                    <Link href={ROUTES.create}>New Post</Link>
                </Button>
            </div>
            <PostList posts={posts} />
        </div>
    );
}
