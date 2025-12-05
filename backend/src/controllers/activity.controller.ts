import { Request, Response, NextFunction } from 'express';
import { activityService } from '../services/activity.service';
import { successResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { BadRequestError } from '../utils/errors';
import path from 'path';
import fs from 'fs';

const deleteFile = (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const fullPath = path.join(process.cwd(), filePath);
    fs.unlink(fullPath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.error('Error deleting file:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

export class ActivityController {
  async getByMissionAndDate(req: Request, res: Response, next: NextFunction) {
    try {
      const { missionId } = req.params;
      const { date } = req.query;

      if (!date) {
        throw new BadRequestError('Date parameter is required');
      }

      const activities = await activityService.getActivitiesByMissionAndDate(
        missionId,
        date as string
      );

      res.json(successResponse(activities));
    } catch (error) {
      next(error);
    }
  }

  async getByCrewAndDate(req: Request, res: Response, next: NextFunction) {
    try {
      const { crewId } = req.params;
      const { date } = req.query;

      if (!date) {
        throw new BadRequestError('Date parameter is required');
      }

      const activities = await activityService.getActivitiesByCrewAndDate(crewId, date as string);

      res.json(successResponse(activities));
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const activity = await activityService.createActivity(req.body, userId);

      res.status(201).json(successResponse(activity, 'Activity created'));
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId!;

      const activity = await activityService.updateActivity(id, req.body, userId);

      res.json(successResponse(activity, 'Activity updated'));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId!;

      await activityService.deleteActivity(id, userId);

      res.json(successResponse(null, 'Activity deleted'));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const activity = await activityService.getActivityById(id);

      res.json(successResponse(activity));
    } catch (error) {
      next(error);
    }
  }

  async getAvailableSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const { crewId } = req.params;
      const { date, duration } = req.query;

      if (!date || !duration) {
        throw new BadRequestError('Date and duration are required');
      }

      const slots = await activityService.getAvailableTimeSlots(
        crewId,
        date as string,
        parseFloat(duration as string)
      );

      res.json(successResponse(slots));
    } catch (error) {
      next(error);
    }
  }

  async uploadPDF(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId!;
      const file = req.file;

      if (!file) {
        throw new BadRequestError('No PDF file provided');
      }

      const activity = await activityService.getActivityById(id);

      if (activity.pdf_url) {
        await deleteFile(activity.pdf_url).catch((err) =>
          console.error('Error deleting old PDF:', err)
        );
      }

      const pdfUrl = `/uploads/activities/${file.filename}`;
      const updated = await activityService.updateActivity(id, { pdf_url: pdfUrl }, userId);

      res.json(successResponse(updated, 'PDF uploaded successfully'));
    } catch (error) {
      next(error);
    }
  }

  async deletePDF(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId!;

      const activity = await activityService.getActivityById(id);

      if (!activity.pdf_url) {
        throw new BadRequestError('Activity has no PDF attached');
      }

      await deleteFile(activity.pdf_url);

      const updated = await activityService.updateActivity(id, { pdf_url: null }, userId);

      res.json(successResponse(updated, 'PDF deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}

export const activityController = new ActivityController();
