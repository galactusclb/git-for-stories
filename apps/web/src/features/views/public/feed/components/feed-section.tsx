import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';

import { ErrorBoundary } from '@/components/shared/errors';
import { Spinner } from '@/components/ui/spinner';
import { ROUTES } from '@/config/routes';
import { getPublishedPosts } from '@/features/post/index.server';
import { Post } from '@/models/post.schema';


async function PostList() {
    const result = await getPublishedPosts();
    const posts: Post[] = result.success ? result.data : [];

    if (posts.length === 0) {
        return (
            <p className="text-muted-foreground text-sm">No published posts yet.</p>
        );
    }

    return (
        <ul className="flex flex-col gap-4">
            {posts.map((post) => (
                <li key={post.id}>
                    <Link
                        href={ROUTES.post(post.id)}
                        className="flex gap-4 rounded-xl border border-border p-4 hover:bg-accent/50 transition-colors"
                    >
                        {post.coverImageUrl && (
                            <div className="relative size-16 shrink-0 overflow-hidden rounded-lg">
                                <Image
                                    src={post.coverImageUrl}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}
                        <div className="flex flex-col gap-1">
                            <p className="font-semibold text-foreground">{post.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">{post.body}</p>
                        </div>
                    </Link>
                </li>
            ))}
        </ul>
    );
}

export default function FeedSection() {
    return (
        <section className="flex flex-col gap-4">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Latest Posts</h2>
                <p className="mt-1 text-muted-foreground text-sm">Published posts from all authors.</p>
            </div>
            <ErrorBoundary>
                <Suspense fallback={<Spinner className="size-6" />}>
                    <PostList />
                </Suspense>
            </ErrorBoundary>
        </section>
    );
}
