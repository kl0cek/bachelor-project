import dotenv from 'dotenv';
import { createServer } from 'http';
import app from './index';
import { initializeDatabase } from './config/database';
import { initializeSocket } from './config/socket';
import { logger } from './config/logger';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

async function startServer() {
  try {
    await initializeDatabase();
    logger.info('✅ Database initialized successfully');

    const httpServer = createServer(app);

    initializeSocket(httpServer);
    logger.info('✅ Socket.io initialized successfully');

  httpServer.listen(PORT, () => {
      logger.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
      logger.info(`API available at http://localhost:${PORT}${process.env.API_PREFIX || '/api'}`);
      logger.info(`WebSocket available at ws://localhost:${PORT}`);
      logger.info(`Health check at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();
