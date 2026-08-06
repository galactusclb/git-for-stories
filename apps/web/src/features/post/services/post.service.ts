'use cache';

import { cacheLife, cacheTag } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';

import { postListResponseSchema, postSingleResponseSchema, Post } from '@/models/post.schema';
import { ApiError } from '@/utils/api/api-error';
import { apiCacheable } from '@/utils/api/api-server';

export async function getPublishedPosts() {
    cacheLife('hours');
    cacheTag('posts');
    return apiCacheable('/posts?published=true', postListResponseSchema);
}

export async function getPostById(id: string): Promise<Post | null> {
    cacheLife('hours');
    cacheTag('posts', `post-${id}`);
    try {
        const res = await apiCacheable(`/posts/${id}`, postSingleResponseSchema);
        return res.success ? res.data : null;
    } catch (error) {
        unstable_rethrow(error);
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
    }
}
