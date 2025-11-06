import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { successResponse, paginatedResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export class UserController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await userService.getAll(page, limit);

      res.json(paginatedResponse(result.users, page, limit, result.total));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.getById(id);

      res.json(successResponse(user));
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const user = await userService.create(req.body, userId);

      res.status(201).json(successResponse(user, 'User created'));
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId!;

      const user = await userService.update(id, req.body, userId);

      res.json(successResponse(user, 'User updated'));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId!;

      await userService.delete(id, userId);

      res.json(successResponse(null, 'User deleted'));
    } catch (error) {
      next(error);
    }
  }

  async toggleStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId!;

      const user = await userService.toggleStatus(id, userId);

      res.json(successResponse(user, 'User status updated'));
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
