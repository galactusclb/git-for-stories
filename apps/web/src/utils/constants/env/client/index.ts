import { clientEnvSchema } from './schema';

let _env: ReturnType<typeof clientEnvSchema.parse> | undefined;

function getEnv() {
    if (!_env) {
        _env = clientEnvSchema.parse({
            NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
        });
    }
    return _env;
}

export const constants = {
    get API() {
        return { URL: getEnv().NEXT_PUBLIC_API_BASE_URL };
    },
};
