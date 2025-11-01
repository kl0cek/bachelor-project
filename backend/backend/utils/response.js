"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginatedResponse = exports.errorResponse = exports.successResponse = void 0;
const successResponse = (data, message) => ({
    success: true,
    data,
    ...(message && { message }),
});
exports.successResponse = successResponse;
const errorResponse = (error) => ({
    success: false,
    error,
});
exports.errorResponse = errorResponse;
const paginatedResponse = (data, page, limit, total) => ({
    success: true,
    data,
    pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
    },
});
exports.paginatedResponse = paginatedResponse;
