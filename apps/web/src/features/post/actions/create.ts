'use server';

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { revalidateTag } from 'next/cache';

import { s3 } from '@/lib/aws';
import { postSingleResponseSchema } from '@/models/post.schema';
import { apiServer } from '@/utils/api/api-server';

export type CreatePostState = {
    success: boolean;
    error?: string;
    postId?: string;
};

export async function createPostAction(
    _prevState: CreatePostState,
    formData: FormData
): Promise<CreatePostState> {
    const title = formData.get('title');
    const body = formData.get('body');
    const published = formData.get('published') === 'true';
    const coverFile = formData.get('coverImage');

    if (typeof title !== 'string' || !title.trim()) {
        return { success: false, error: 'Title is required' };
    }
    if (typeof body !== 'string' || !body.trim()) {
        return { success: false, error: 'Body is required' };
    }

    let coverImageUrl: string | undefined;
    if (coverFile instanceof File && coverFile.size > 0) {
        try {
            coverImageUrl = await uploadCoverImage(coverFile);
        } catch {
            return { success: false, error: 'Failed to upload cover image. Please try again.' };
        }
    }

    try {
        const result = await apiServer(
            '/posts',
            postSingleResponseSchema,
            {
                method: 'POST',
                body: JSON.stringify({ title, body, published, coverImageUrl }),
            },
            true
        );

        revalidateTag('posts', "max");
        return { success: true, postId: result.success ? result.data.id : undefined };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create post';
        return { success: false, error: message };
    }
}

async function uploadCoverImage(image: File): Promise<string> {
    const { client, bucket } = await s3.getS3ClientInstance();
    const key = `posts/covers/${crypto.randomUUID()}/${image.name}`;

    await client.send(
        new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: Buffer.from(await image.arrayBuffer()),
            ContentType: image.type,
        })
    );

    return s3.buildS3Url(key);
}
