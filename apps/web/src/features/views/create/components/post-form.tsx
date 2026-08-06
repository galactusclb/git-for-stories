'use client';

import { useRouter } from 'next/navigation';
import { useActionState } from 'react';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { ROUTES } from '@/config/routes';
import { createPostAction } from '@/features/post';
import type { CreatePostState } from '@/features/post';

import CoverUpload from './cover-upload';

const initialState: CreatePostState = { success: false };

export default function PostForm() {
    const router = useRouter();
    const [state, action, isPending] = useActionState(createPostAction, initialState);

    useEffect(() => {
        if (state.success && state.postId) {
            toast.success('Post created!');
            router.push(ROUTES.dashboard);
        } else if (!state.success && state.error) {
            toast.error(state.error);
        }
    }, [state, router]);

    return (
        <form action={action} className="flex flex-col gap-6 max-w-2xl w-full">
            <div className="flex flex-col gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    name="title"
                    placeholder="Your post title"
                    required
                    disabled={isPending}
                />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="body">Body</Label>
                <Textarea
                    id="body"
                    name="body"
                    placeholder="Write your post content here…"
                    required
                    disabled={isPending}
                    className="min-h-[200px]"
                />
            </div>

            <div className="flex flex-col gap-2">
                <Label>Cover Image</Label>
                <CoverUpload name="coverImage" />
            </div>

            <div className="flex items-center gap-3">
                <Button type="submit" name="published" value="false" disabled={isPending} variant="outline">
                    {isPending ? <Spinner /> : 'Save as Draft'}
                </Button>
                <Button type="submit" name="published" value="true" disabled={isPending}>
                    {isPending ? <Spinner /> : 'Publish'}
                </Button>
            </div>
        </form>
    );
}
