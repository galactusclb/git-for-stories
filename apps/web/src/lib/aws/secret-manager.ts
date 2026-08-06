import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

import { constants } from '@/utils/constants/env/server';

import { SecretManagerResponse, secretManagerResponseSchema } from './secret-manager.schema';

type SecretsManagerInstance = {
    client: SecretsManagerClient;
    region: string;
    secret_name: string;
};

const SECRET_NAME = constants.AWS.SECRET_MANAGER_SECRET_NAME;

let instance: SecretsManagerInstance | undefined;

export const getSecretManagerClientInstance = (): SecretsManagerInstance => {
    if (instance) return instance;

    const region = constants.AWS.REGION;

    instance = {
        client: new SecretsManagerClient({
            region,
        }),
        region,
        secret_name: SECRET_NAME,
    };

    return instance;
};

let cachedSecret: SecretManagerResponse | undefined;

export const getSecretValueFromAWS = async (
    instance: SecretsManagerInstance = getSecretManagerClientInstance()
): Promise<SecretManagerResponse> => {
    if (cachedSecret) return cachedSecret as SecretManagerResponse;

    try {
        const response = await instance.client?.send(
            new GetSecretValueCommand({
                SecretId: instance.secret_name,
            })
        );
        const parsed = secretManagerResponseSchema.parse(
            JSON.parse(response.SecretString ?? '')
        );
        cachedSecret = parsed;
        return parsed;
    } catch (error) {
        console.error('Secret fetching failed:', error);
        throw new Error('Secret fetching failed');
    }
};
