import { logger } from '@/lib/logger';
import { getRedisClient } from '@/lib/redis/redis-client.ts';

import app from './app.ts';

const PORT = process.env.PORT || 4000;

async function bootstrap() {
    getRedisClient(
        process.env.REDIS_CLIENT_URL
            ? { url: process.env.REDIS_CLIENT_URL, host: '', port: 6379 }
            : { host: process.env.REDIS_HOST ?? 'localhost', port: 6379 }
    );
}

await bootstrap();

app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
});
