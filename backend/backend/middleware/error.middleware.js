"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("../config/logger");
const errors_1 = require("../utils/errors");
const errorHandler = (error, req, res, next) => {
    logger_1.logger.error('Error:', {
        message: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
    });
    if (error instanceof errors_1.AppError) {
        return res.status(error.statusCode).json({
            success: false,
            error: {
                message: error.message,
                code: error.code,
                ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
            },
        });
    }
    // Unhandled errors
    res.status(500).json({
        success: false,
        error: {
            message: 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && {
                details: error.message,
                stack: error.stack,
            }),
        },
    });
};
exports.errorHandler = errorHandler;
