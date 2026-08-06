import { Post } from '@/models/post.schema';

import PostRow from './post-row';

export default function PostList({ posts }: { posts: Post[] }) {
    if (posts.length === 0) {
        return (
            <p className="text-muted-foreground text-sm">
                You haven&apos;t written any posts yet.
            </p>
        );
    }

    return (
        <ul className="flex flex-col gap-3">
            {posts.map((post) => (
                <PostRow key={post.id} post={post} />
            ))}
        </ul>
    );
}
