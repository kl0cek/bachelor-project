import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User.entity';
import { RefreshToken } from '../entities/RefreshToken.entity';
import { UnauthorizedError, NotFoundError  } from '../utils/errors';
import { auditService } from './audit.service';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: Partial<User>;
}

class AuthService {
  private userRepository = AppDataSource.getRepository(User);
  private refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

  async login(
    credentials: LoginCredentials,
    ipAddress?: string,
    userAgent?: string
  ): Promise<TokenResponse> {
    const { username, password } = credentials;

    // Find user with password field
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password_hash')
      .where('user.username = :username', { username })
      .getOne();

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.is_active) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Validate password
    const isValid = await user.validatePassword(password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Update last login
    user.last_login = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = await this.generateRefreshToken(
      user.id,
      ipAddress,
      userAgent
    );

    // Log audit
    await auditService.log({
      userId: user.id,
      action: 'login',
      resourceType: 'auth',
      ipAddress,
      userAgent,
    });

    // Remove sensitive data
    const { password_hash, ...userWithoutPassword } = user as any;

    return {
      accessToken,
      refreshToken: refreshToken.token,
      expiresIn: this.getTokenExpiresIn(),
      user: userWithoutPassword,
    };
  }

  async logout(refreshToken: string, userId: string): Promise<void> {
    const token = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken, user_id: userId },
    });

    if (token) {
      token.revoked_at = new Date();
      await this.refreshTokenRepository.save(token);
    }

    // Log audit
    await auditService.log({
      userId,
      action: 'logout',
      resourceType: 'auth',
    });
  }

  async refreshAccessToken(
    refreshToken: string,
    ipAddress?: string
  ): Promise<Omit<TokenResponse, 'user'>> {
    const token = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
      relations: ['user'],
    });

    if (!token || !token.isValid()) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    if (!token.user.is_active) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Generate new access token
    const accessToken = this.generateAccessToken(token.user_id);

    return {
      accessToken,
      refreshToken: token.token,
      expiresIn: this.getTokenExpiresIn(),
    };
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository
      .createQueryBuilder()
      .update(RefreshToken)
      .set({ revoked_at: new Date() })
      .where('user_id = :userId', { userId })
      .andWhere('revoked_at IS NULL')
      .execute();
  }

  private generateAccessToken(userId: string): string {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    return jwt.sign({ userId }, secret, { expiresIn });
  }

  private async generateRefreshToken(
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<RefreshToken> {
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET not configured');
    }

    const token = jwt.sign({ userId, type: 'refresh' }, secret, { expiresIn });

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

  private getTokenExpiresIn(): number {
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    const hours = parseInt(expiresIn) || 24;
    return hours * 3600; // Convert to seconds
  }

  async getCurrentUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.refreshTokenRepository
      .createQueryBuilder()
      .delete()
      .where('expires_at < :now', { now: new Date() })
      .orWhere('revoked_at IS NOT NULL')
      .execute();
  }
}

export const authService = new AuthService();
