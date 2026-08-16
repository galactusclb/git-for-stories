import { logger } from '@/lib/logger';
import prisma from '@/lib/prisma/prisma';
import { redisClient } from '@/lib/redis/redis-client.ts';

import app, { closeInfrastructure } from './app.ts';

const PORT = process.env.PORT || 4000;
const SHUTDOWN_TIMEOUT_MS = 15_000;

// async function bootstrap() {
//     getRedisClient(
//         process.env.REDIS_CLIENT_URL
//             ? { url: process.env.REDIS_CLIENT_URL, host: '', port: 6379 }
//             : { host: process.env.REDIS_HOST ?? 'localhost', port: 6379 }
//     );
// }

// await bootstrap();

const server = app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
});

let shuttingDown = false;

async function shutdown(signal: string): Promise<void> {
    if (shuttingDown) return;

    shuttingDown = true;

    logger.info('shutting down', { signal });

    const forceExit = setTimeout(() => {
        logger.error('graceful shutdown timed out, forcing exit');
        process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);

    forceExit.unref();

    try {
        await new Promise<void>((resolve) => server.close(() => resolve()));

        await closeInfrastructure();

        await prisma.$disconnect();
        await redisClient?.quit();

        logger.info('shutdown complete');
        process.exit(0);
    } catch (err) {
        logger.error('error during shutdown', { err });
        process.exit(1);
    }
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => void shutdown(signal));
}

process.on('unhandledRejection', (reason) => {
    logger.error('unhandled rejection', { reason });
});
