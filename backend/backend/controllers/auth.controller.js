"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const response_1 = require("../utils/response");
class AuthController {
    async login(req, res, next) {
        try {
            const { username, password } = req.body;
            const ipAddress = req.ip;
            const userAgent = req.get('user-agent');
            const result = await auth_service_1.authService.login({ username, password }, ipAddress, userAgent);
            res.json((0, response_1.successResponse)(result, 'Login successful'));
        }
        catch (error) {
            next(error);
        }
    }
    async logout(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const userId = req.userId;
            await auth_service_1.authService.logout(refreshToken, userId);
            res.json((0, response_1.successResponse)(null, 'Logout successful'));
        }
        catch (error) {
            next(error);
        }
    }
    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const ipAddress = req.ip;
            const result = await auth_service_1.authService.refreshAccessToken(refreshToken, ipAddress);
            res.json((0, response_1.successResponse)(result, 'Token refreshed'));
        }
        catch (error) {
            next(error);
        }
    }
    async getCurrentUser(req, res, next) {
        try {
            const userId = req.userId;
            const user = await auth_service_1.authService.getCurrentUser(userId);
            res.json((0, response_1.successResponse)(user));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
