import { Response, NextFunction } from 'express';
import { UserRole } from '../entities/User.entity';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { AuthRequest } from './auth.middleware';

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Not authenticated'));
    }

    if (req.user.role === UserRole.ADMIN) {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions to access this resource'));
    }

    next();
  };
};

export const requirePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Not authenticated'));
    }

    if (!req.user.hasPermission(permission)) {
      return next(new ForbiddenError(`Missing required permission: ${permission}`));
    }

    next();
  };
};
