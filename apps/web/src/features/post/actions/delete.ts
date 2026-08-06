'use server';

import { revalidateTag } from 'next/cache';

import { postSingleResponseSchema } from '@/models/post.schema';
import { apiServer } from '@/utils/api/api-server';

export type DeletePostState = {
    success: boolean;
    error?: string;
};

export async function deletePostAction(id: string): Promise<DeletePostState> {
    try {
        await apiServer(`/posts/${id}`, postSingleResponseSchema, { method: 'DELETE' }, true);
        revalidateTag('posts', "max");
        revalidateTag(`post-${id}`, "max");
        return { success: true };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete post';
        return { success: false, error: message };
    }
}
