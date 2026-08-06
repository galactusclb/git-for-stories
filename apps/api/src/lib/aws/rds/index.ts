import { Signer } from '@aws-sdk/rds-signer';

const signer = new Signer({
    hostname: process.env.RDS_PROXY_ENDPOINT!,
    port: parseInt(process.env.DB_PORT ?? '5432'),
    username: process.env.DB_USER!,
    region: process.env.AWS_DEFAULT_REGION!,
});

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export const TOKEN_TTL = 14 * 60;

export const getRDSAuthToken = async (): Promise<string> => {
    const now = Date.now();
    if (cachedToken && now < tokenExpiresAt) return cachedToken;

    cachedToken = await signer.getAuthToken();
    tokenExpiresAt = now + TOKEN_TTL * 1000;
    return cachedToken;
};
