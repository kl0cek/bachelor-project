import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User.entity';
import { UnauthorizedError } from '../utils/errors';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: string;
    }
  }
}

export interface AuthRequest extends Request {
  user?: User;
  userId?: string;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: string };

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: decoded.userId, is_active: true },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid token or user deactivated');
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired'));
    } else {
      next(error);
    }
  }
};
