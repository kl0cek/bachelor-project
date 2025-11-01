"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const User_entity_1 = require("../entities/User.entity");
const RefreshToken_entity_1 = require("../entities/RefreshToken.entity");
const errors_1 = require("../utils/errors");
const audit_service_1 = require("./audit.service");
class AuthService {
    constructor() {
        this.userRepository = database_1.AppDataSource.getRepository(User_entity_1.User);
        this.refreshTokenRepository = database_1.AppDataSource.getRepository(RefreshToken_entity_1.RefreshToken);
    }
    async login(credentials, ipAddress, userAgent) {
        const { username, password } = credentials;
        // Find user with password field
        const user = await this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.password_hash')
            .where('user.username = :username', { username })
            .getOne();
        if (!user) {
            throw new errors_1.UnauthorizedError('Invalid credentials');
        }
        if (!user.is_active) {
            throw new errors_1.UnauthorizedError('Account is deactivated');
        }
        // Validate password
        const isValid = await user.validatePassword(password);
        if (!isValid) {
            throw new errors_1.UnauthorizedError('Invalid credentials');
        }
        // Update last login
        user.last_login = new Date();
        await this.userRepository.save(user);
        // Generate tokens
        const accessToken = this.generateAccessToken(user.id);
        const refreshToken = await this.generateRefreshToken(user.id, ipAddress, userAgent);
        // Log audit
        await audit_service_1.auditService.log({
            userId: user.id,
            action: 'login',
            resourceType: 'auth',
            ipAddress,
            userAgent,
        });
        // Remove sensitive data
        const { password_hash, ...userWithoutPassword } = user;
        return {
            accessToken,
            refreshToken: refreshToken.token,
            expiresIn: this.getTokenExpiresIn(),
            user: userWithoutPassword,
        };
    }
    async logout(refreshToken, userId) {
        const token = await this.refreshTokenRepository.findOne({
            where: { token: refreshToken, user_id: userId },
        });
        if (token) {
            token.revoked_at = new Date();
            await this.refreshTokenRepository.save(token);
        }
        // Log audit
        await audit_service_1.auditService.log({
            userId,
            action: 'logout',
            resourceType: 'auth',
        });
    }
    async refreshAccessToken(refreshToken, ipAddress) {
        const token = await this.refreshTokenRepository.findOne({
            where: { token: refreshToken },
            relations: ['user'],
        });
        if (!token || !token.isValid()) {
            throw new errors_1.UnauthorizedError('Invalid or expired refresh token');
        }
        if (!token.user.is_active) {
            throw new errors_1.UnauthorizedError('Account is deactivated');
        }
        // Generate new access token
        const accessToken = this.generateAccessToken(token.user_id);
        return {
            accessToken,
            refreshToken: token.token,
            expiresIn: this.getTokenExpiresIn(),
        };
    }
    async revokeAllUserTokens(userId) {
        await this.refreshTokenRepository
            .createQueryBuilder()
            .update(RefreshToken_entity_1.RefreshToken)
            .set({ revoked_at: new Date() })
            .where('user_id = :userId', { userId })
            .andWhere('revoked_at IS NULL')
            .execute();
    }
    generateAccessToken(userId) {
        const secret = process.env.JWT_SECRET;
        const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
        if (!secret) {
            throw new Error('JWT_SECRET not configured');
        }
        return jsonwebtoken_1.default.sign({ userId }, secret, { expiresIn });
    }
    async generateRefreshToken(userId, ipAddress, userAgent) {
        const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
        const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
        if (!secret) {
            throw new Error('JWT_REFRESH_SECRET not configured');
        }
        const token = jsonwebtoken_1.default.sign({ userId, type: 'refresh' }, secret, { expiresIn });
        // Calculate expiration date
        const expiresAt = new Date();
        const days = parseInt(expiresIn) || 7;
        expiresAt.setDate(expiresAt.getDate() + days);
        const refreshToken = this.refreshTokenRepository.create({
            user_id: userId,
            token,
            expires_at: expiresAt,
            ip_address: ipAddress,
            user_agent: userAgent,
        });
        return await this.refreshTokenRepository.save(refreshToken);
    }
    getTokenExpiresIn() {
        const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
        const hours = parseInt(expiresIn) || 24;
        return hours * 3600; // Convert to seconds
    }
    async getCurrentUser(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        return user;
    }
    async cleanupExpiredTokens() {
        await this.refreshTokenRepository
            .createQueryBuilder()
            .delete()
            .where('expires_at < :now', { now: new Date() })
            .orWhere('revoked_at IS NOT NULL')
            .execute();
    }
}
exports.authService = new AuthService();
