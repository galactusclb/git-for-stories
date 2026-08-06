import { getPostById } from '@/features/post/index.server';

import PostDetail from './components/post-detail';
import PostNotFound from './components/post-not-found';

export default async function PostContainer({ id }: { id: string }) {
    const post = await getPostById(id);

    if (!post || !post.published) return <PostNotFound />;

    return <PostDetail post={post} />;
}
