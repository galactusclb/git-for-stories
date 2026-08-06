'use server';

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { revalidateTag } from 'next/cache';

import { s3 } from '@/lib/aws';
import { postSingleResponseSchema } from '@/models/post.schema';
import { apiServer } from '@/utils/api/api-server';

export type UpdatePostState = {
    success: boolean;
    error?: string;
};

export async function updatePostAction(
    _prevState: UpdatePostState,
    formData: FormData
): Promise<UpdatePostState> {
    const id = formData.get('id');
    const title = formData.get('title');
    const body = formData.get('body');
    const published = formData.get('published') === 'true';
    const coverFile = formData.get('coverImage');

    if (typeof id !== 'string' || !id) {
        return { success: false, error: 'Post ID is required' };
    }

    let coverImageUrl: string | undefined;
    if (coverFile instanceof File && coverFile.size > 0) {
        try {
            const { client, bucket } = await s3.getS3ClientInstance();
            const key = `posts/covers/${crypto.randomUUID()}/${coverFile.name}`;
            await client.send(
                new PutObjectCommand({
                    Bucket: bucket,
                    Key: key,
                    Body: Buffer.from(await coverFile.arrayBuffer()),
                    ContentType: coverFile.type,
                })
            );
            coverImageUrl = s3.buildS3Url(key);
        } catch {
            return { success: false, error: 'Failed to upload cover image. Please try again.' };
        }
    }

    try {
        await apiServer(
            `/posts/${id}`,
            postSingleResponseSchema,
            {
                method: 'PATCH',
                body: JSON.stringify({
                    ...(typeof title === 'string' && title && { title }),
                    ...(typeof body === 'string' && body && { body }),
                    ...(coverImageUrl && { coverImageUrl }),
                    published,
                }),
            },
            true
        );

        revalidateTag('posts', "max");
        revalidateTag(`post-${id}`, "max");
        return { success: true };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update post';
        return { success: false, error: message };
    }
}
