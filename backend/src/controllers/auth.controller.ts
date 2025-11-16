import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { successResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');

      const result = await authService.login({ username, password }, ipAddress, userAgent);

      const isProduction = process.env.NODE_ENV === 'production';

      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: result.expiresIn * 1000,
        domain: '.onrender.com',
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        domain: '.onrender.com',
      });

      const { accessToken, refreshToken, ...responseData } = result;

      res.json(successResponse(responseData, 'Login successful'));
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;
      const userId = req.userId!;

      if (refreshToken) {
        await authService.logout(refreshToken, userId);
      }

      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      res.json(successResponse(null, 'Logout successful'));
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;
      const ipAddress = req.ip;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: { message: 'No refresh token provided' },
        });
      }

      const result = await authService.refreshAccessToken(refreshToken, ipAddress);

      const isProduction = process.env.NODE_ENV === 'production';

      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: result.expiresIn * 1000,
        domain: '.onrender.com',
      });

      res.json(successResponse({ expiresIn: result.expiresIn }, 'Token refreshed'));
    } catch (error) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      next(error);
    }
  }

  async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const user = await authService.getCurrentUser(userId);

      res.json(successResponse(user));
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
