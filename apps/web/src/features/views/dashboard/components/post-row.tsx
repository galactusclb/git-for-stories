'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { deletePostAction } from '@/features/post';
import { Post } from '@/models/post.schema';

export default function PostRow({ post }: { post: Post }) {
    const [isPending, startTransition] = useTransition();

    function handleDelete() {
        startTransition(async () => {
            const result = await deletePostAction(post.id);
            if (result.success) {
                toast.success('Post deleted');
            } else {
                toast.error(result.error ?? 'Failed to delete post');
            }
        });
    }

    return (
        <li className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
            <div className="flex flex-col gap-1 min-w-0">
                <Link
                    href={post.published ? ROUTES.post(post.id) : '#'}
                    className="font-semibold truncate hover:underline"
                >
                    {post.title}
                </Link>
                <span className={`text-xs font-medium ${post.published ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {post.published ? 'Published' : 'Draft'}
                </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/edit/${post.id}`}>Edit</Link>
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isPending}
                >
                    {isPending ? 'Deleting…' : 'Delete'}
                </Button>
            </div>
        </li>
    );
}
