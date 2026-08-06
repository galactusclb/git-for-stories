import { S3Client } from '@aws-sdk/client-s3';

import { constants } from '@/utils/constants/env/server';

type S3Instance = {
    client: S3Client;
    region: string;
    bucket: string;
};

let instance: S3Instance | undefined;

export const getS3ClientInstance = async (): Promise<S3Instance> => {
    if (instance) return instance;

    instance = {
        client: new S3Client({ region: constants.AWS.REGION }),
        region: constants.AWS.REGION,
        bucket: constants.AWS.S3_BUCKET_NAME,
    };

    return instance;
};

export const buildS3Url = (key: string): string => {
    const cloudfrontDomain = constants.AWS.CLOUDFRONT_DOMAIN;
    if (!cloudfrontDomain) throw new Error('AWS_CLOUDFRONT_DOMAIN is not set');
    return `https://${cloudfrontDomain}/${key}`;
};
