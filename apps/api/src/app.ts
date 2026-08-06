import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

import { routes as authRoutes } from '@/features/auth';
import { routes as postRoutes } from '@/features/post';
import { configureXray, xrayClose, xrayOpen } from '@/lib/aws/xray';
import { errorHandler } from '@/middleware/error.middleware.ts';

const app = express();
const apiRouter = express.Router();

const allowedOrigins = ['http://localhost:3000', process.env.WEB_APP_URL];

configureXray();
app.use(xrayOpen);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (!allowedOrigins.includes(origin)) {
                return callback(
                    new Error('CORS policy does not allow access from the specified origin'),
                    false
                );
            }
            return callback(null, true);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
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

app.use('/api', apiRouter);

app.use(xrayClose);
app.use(errorHandler);

export default app;
