export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { constants } = await import('@/utils/constants/env/server');

        void constants.API;
        void constants.AWS;
    }
}
