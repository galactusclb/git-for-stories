import { logger } from '@/lib/logger/index.ts';
import { redisClient } from '@/lib/redis/redis-client.ts';
import { swrCache } from '@/lib/redis/utils.ts';
import { constants } from '@/utils/constant/index.ts';
import { ForbiddenError, NotFoundError } from '@/utils/errors/http-error.ts';
import { paginate, paginatedResponse } from '@/utils/paginate-helpers.ts';

import { toPostDTO } from './post.dto.ts';
import {
    countPosts,
    createPost,
    deletePost,
    findPostById,
    findPosts,
    updatePost,
} from './post.repository.ts';
import { CreatePostInput, ListPostsQuery, UpdatePostInput } from './post.schema.ts';

const { post: postCacheCfg } = constants.cache;

function listCacheKey(query: ListPostsQuery) {
    return `post:list:${JSON.stringify(query)}`;
}

function singleCacheKey(id: string) {
    return `post:single:${id}`;
}

export async function listPosts(query: ListPostsQuery) {
    const { skip, take } = paginate(query);
    const filter = { published: query.published };

    logger.info('agg');
    return swrCache(
        listCacheKey(query),
        async () => {
            const [posts, total] = await Promise.all([
                findPosts(filter, skip, take),
                countPosts(filter),
            ]);
            return paginatedResponse(posts.map(toPostDTO), total, query);
        },
        {
            redis_fresh_ttl: postCacheCfg.list.redis_fresh_ttl,
            redis_stale_ttl: postCacheCfg.list.redis_stale_ttl + postCacheCfg.list.header_swr,
        }
    );
}

export async function getPost(id: string) {
    return swrCache(
        singleCacheKey(id),
        async () => {
            const post = await findPostById(id);
            if (!post) throw new NotFoundError('Post not found');
            return toPostDTO(post);
        },
        {
            redis_fresh_ttl: postCacheCfg.single.redis_fresh_ttl,
            redis_stale_ttl: postCacheCfg.single.redis_stale_ttl + postCacheCfg.single.header_swr,
        }
    );
}

export async function createNewPost(input: CreatePostInput, authorId: string) {
    const post = await createPost({ ...input, authorId });
    await invalidateListCache();
    return toPostDTO(post);
}

export async function updateExistingPost(
    id: string,
    input: UpdatePostInput,
    requesterId: string,
    requesterRole: string
) {
    const existing = await findPostById(id);
    if (!existing) throw new NotFoundError('Post not found');
    if (existing.authorId !== requesterId && requesterRole !== 'ADMIN') {
        throw new ForbiddenError('Not allowed to update this post');
    }

    const post = await updatePost(id, input);
    await invalidatePostCache(id);
    return toPostDTO(post);
}

export async function deleteExistingPost(id: string, requesterId: string, requesterRole: string) {
    const existing = await findPostById(id);
    if (!existing) throw new NotFoundError('Post not found');
    if (existing.authorId !== requesterId && requesterRole !== 'ADMIN') {
        throw new ForbiddenError('Not allowed to delete this post');
    }

    await deletePost(id);
    await invalidatePostCache(id);
    await invalidateListCache();
}

async function invalidatePostCache(id: string) {
    await redisClient?.del(singleCacheKey(id));
}

async function invalidateListCache() {
    // Pattern-based invalidation: scan and delete all post:list:* keys
    let cursor = '0';
    do {
        const [next, keys] = (await redisClient?.scan(
            cursor,
            'MATCH',
            'post:list:*',
            'COUNT',
            100
        )) ?? ['0', []];
        cursor = next;
        if (keys.length) await redisClient?.del(...keys);
    } while (cursor !== '0');
}
