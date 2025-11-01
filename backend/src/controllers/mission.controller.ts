import { Request, Response, NextFunction } from 'express';
import { missionService } from '../services/mission.service';
import { successResponse, paginatedResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export class MissionController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, startDate, endDate } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await missionService.getAll(
        {
          status: status as any,
          startDate: startDate as string,
          endDate: endDate as string,
        },
        page,
        limit
      );

      res.json(
        paginatedResponse(result.missions, page, limit, result.total)
      );
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const mission = await missionService.getById(id);

      res.json(successResponse(mission));
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const mission = await missionService.create(req.body, userId);

      res.status(201).json(successResponse(mission, 'Mission created'));
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId!;

      const mission = await missionService.update(id, req.body, userId);

      res.json(successResponse(mission, 'Mission updated'));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId!;

      await missionService.delete(id, userId);

      res.json(successResponse(null, 'Mission deleted'));
    } catch (error) {
      next(error);
    }
  }

  async getActive(req: Request, res: Response, next: NextFunction) {
    try {
      const missions = await missionService.getActiveMissions();

      res.json(successResponse(missions));
    } catch (error) {
      next(error);
    }
  }
}

export const missionController = new MissionController();
