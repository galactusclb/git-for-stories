import { Suspense } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { getPublishedPosts } from '@/features/post/index.server';
import { PostContainer } from '@/features/views/public/post';

export const dynamicParams = true;

export async function generateStaticParams() {
    try {
        const result = await getPublishedPosts();
        const posts = result.success ? result.data : [];
        return posts.map((p) => ({ id: p.id }));
    } catch {
        return [];
    }
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <Suspense fallback={<Spinner className="size-8 mx-auto mt-24" />}>
            <PostContainer id={id} />
        </Suspense>
    );
}
