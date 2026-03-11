import { Request, Response, NextFunction } from 'express';
import { videoRoomService } from '../services/videoRoom.service';

export class VideoRoomController {
  async createRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const { missionId, roomName } = req.body;
      const userId = req.userId!;

      const room = await videoRoomService.createRoom(missionId, userId, roomName);

      res.status(201).json({
        success: true,
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrCreateRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const { missionId } = req.params;
      const userId = req.userId!;

      const room = await videoRoomService.getOrCreateRoomForMission(missionId, userId);

      res.json({
        success: true,
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRoomById(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;

      const room = await videoRoomService.getRoomById(roomId);

      res.json({
        success: true,
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }

  async endRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;

      const room = await videoRoomService.endRoom(roomId);

      res.json({
        success: true,
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateDelay(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const { delay_seconds, delay_enabled } = req.body;

      const room = await videoRoomService.updateDelay(roomId, {
        delay_seconds: Number(delay_seconds) || 0,
        delay_enabled: Boolean(delay_enabled),
      });

      res.json({
        success: true,
        data: {
          id: room.id,
          delay_seconds: room.delay_seconds,
          delay_enabled: room.delay_enabled,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getDelayConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;

      const delayConfig = await videoRoomService.getDelayConfig(roomId);

      res.json({
        success: true,
        data: delayConfig,
      });
    } catch (error) {
      next(error);
    }
  }

  async getActiveSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;

      const sessions = await videoRoomService.getActiveSessions(roomId);

      res.json({
        success: true,
        data: sessions,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRoomHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { missionId } = req.params;

      const rooms = await videoRoomService.getRoomHistory(missionId);

      res.json({
        success: true,
        data: rooms,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const videoRoomController = new VideoRoomController();
