import { Request, Response, NextFunction } from 'express';
import { crewService } from '../services/crew.service';
import { successResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export class CrewController {
  async getByMission(req: Request, res: Response, next: NextFunction) {
    try {
      const { missionId } = req.params;
      const crew = await crewService.getByMission(missionId);

      res.json(successResponse(crew));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const crew = await crewService.getById(id);

      res.json(successResponse(crew));
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const crew = await crewService.create(req.body, userId);

      res.status(201).json(successResponse(crew, 'Crew member added'));
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId!;

      const crew = await crewService.update(id, req.body, userId);

      res.json(successResponse(crew, 'Crew member updated'));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId!;

      await crewService.delete(id, userId);

      res.json(successResponse(null, 'Crew member removed'));
    } catch (error) {
      next(error);
    }
  }
}

export const crewController = new CrewController();
