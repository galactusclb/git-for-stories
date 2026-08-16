import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

import { routes as authRoutes } from '@/features/auth';
import { routes as postRoutes } from '@/features/post';
import { createStoryModule } from '@/features/story';
import { configureXray, xrayClose, xrayOpen } from '@/lib/aws/xray';
import { errorHandler } from '@/middleware/error.middleware.ts';
import { constants } from '@/utils/constant';

import { createEmbeddingProvider, createLLMProvider } from './lib/llm/llm-provider.factory';
import { createJobConsumer, createQueueJobProducer } from './lib/queue/queue-provider.factory';

const app = express();
const apiRouter = express.Router();

const allowedOrigins = ['http://localhost:3000', constants.PORT];

configureXray();
app.use(xrayOpen);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (!allowedOrigins.includes(origin)) {
                return callback(
                    new Error('CORS policy does not allow access from the specified origin'),
                    false,
                );
            }
            return callback(null, true);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }),
);

app.use(cookieParser());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.use((req: Request, _res: Response, next) => {
    if (req.originalUrl !== '/api/health') {
        console.log(`[${req.method}] ${req.originalUrl}`);
    }
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const handleRoot = (_req: Request, res: Response) => {
    res.status(200).json({ message: 'API is running' });
};

app.get('/', handleRoot);

apiRouter.get('/', handleRoot);
apiRouter.get('/health', (_req, res) => res.sendStatus(200));
apiRouter.use('/auth', authRoutes);
apiRouter.use('/posts', postRoutes);

const llmProvider = createLLMProvider('deepseek');
const embeddingProvider = createEmbeddingProvider('gemini');
const jobProducer = createQueueJobProducer('bullmq');
const jobConsumer = createJobConsumer('bullmq');

const storyModule = createStoryModule({
    llmProvider,
    embeddingProvider,
    jobProducer,
    jobConsumer,
    embeddingModel: 'gemini-embedding-2',
});

apiRouter.use('/stories', storyModule.router);

app.use('/api', apiRouter);

app.use(xrayClose);
app.use(errorHandler);

export default app;
