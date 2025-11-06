"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const index_1 = __importDefault(require("./index"));
const database_1 = require("./config/database");
const logger_1 = require("./config/logger");
// Load environment variables
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
async function startServer() {
    try {
        // Initialize database connection
        await (0, database_1.initializeDatabase)();
        logger_1.logger.info('✅ Database initialized successfully');
        // Start Express server
        index_1.default.listen(PORT, () => {
            logger_1.logger.info(`🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
            logger_1.logger.info(`📡 API available at http://localhost:${PORT}${process.env.API_PREFIX || '/api'}`);
            logger_1.logger.info(`🏥 Health check at http://localhost:${PORT}/health`);
        });
    }
    catch (error) {
        logger_1.logger.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
// Graceful shutdown
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});
process.on('SIGINT', () => {
    logger_1.logger.info('SIGINT signal received: closing HTTP server');
    process.exit(0);
});
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Uncaught Exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
// Start the server
startServer();
