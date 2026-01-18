import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import path from 'path';
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';
import { NotFoundError } from './utils/errors';

const app: Application = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cookieParser());
app.set('trust proxy', 1);

const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['https://localhost:5173'] || [
      'https://192.168.0.100:5173',
    ],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '200'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(compression());

app.use(requestLogger);

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

const apiPrefix = process.env.API_PREFIX || '/api';
app.use('/api/', limiter);
app.use(apiPrefix, routes);

app.use((req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

app.use(errorHandler);

export default app;
