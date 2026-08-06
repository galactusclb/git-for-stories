import z from 'zod';

export const apiBuildEnvSchema = z.object({
    API_BASE_URL: z.string().min(1, 'API_BASE_URL is required'),
});

export const awsRuntimeEnvSchema = z.object({
    AWS_REGION: z.string().min(1, 'AWS_REGION is required'),
    AWS_SECRET_MANAGER_SECRET_NAME: z.string().min(1, 'AWS_SECRET_MANAGER_SECRET_NAME is required'),
    AWS_CLOUDFRONT_DOMAIN: z.string().min(1, 'AWS_CLOUDFRONT_DOMAIN is required'),
    AWS_S3_BUCKET_NAME: z.string().min(1, 'AWS_S3_BUCKET_NAME is required'),
});
