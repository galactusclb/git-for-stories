import Image from 'next/image';

import { Post } from '@/models/post.schema';

export default function PostDetail({ post }: { post: Post }) {
    return (
        <article className="flex flex-col gap-8 max-w-2xl mx-auto w-full">
            {post.coverImageUrl && (
                <div className="relative w-full aspect-video overflow-hidden rounded-2xl">
                    <Image
                        src={post.coverImageUrl}
                        alt={post.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            )}
            <div className="flex flex-col gap-3">
                <h1 className="text-4xl font-black tracking-tight">{post.title}</h1>
                <p className="text-sm text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </p>
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-foreground leading-relaxed">{post.body}</p>
            </div>
        </article>
    );
}
