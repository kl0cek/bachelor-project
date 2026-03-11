import { AppDataSource } from '../config/database';
import { VideoRoom } from '../entities/VideoRoom.entity';
import { VideoSession } from '../entities/VideoSession.entity';
import { Mission } from '../entities/Mission.entity';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { IsNull } from 'typeorm';

export interface UpdateDelayDto {
  delay_seconds: number;
  delay_enabled: boolean;
}

export class VideoRoomService {
  private videoRoomRepository = AppDataSource.getRepository(VideoRoom);
  private videoSessionRepository = AppDataSource.getRepository(VideoSession);
  private missionRepository = AppDataSource.getRepository(Mission);

  async createRoom(missionId: string, userId: string, roomName?: string): Promise<VideoRoom> {
    const mission = await this.missionRepository.findOne({ where: { id: missionId } });
    if (!mission) {
      throw new NotFoundError('Mission not found');
    }

    const existingRoom = await this.videoRoomRepository.findOne({
      where: { mission_id: missionId, is_active: true },
    });

    if (existingRoom) {
      throw new BadRequestError('Active video room already exists for this mission');
    }

    const room = this.videoRoomRepository.create({
      mission_id: missionId,
      room_name: roomName || `${mission.name} - Video Call`,
      created_by: userId,
      is_active: true,
      delay_seconds: 0,
      delay_enabled: false,
    });

    return await this.videoRoomRepository.save(room);
  }

  async getRoomById(roomId: string): Promise<VideoRoom> {
    const room = await this.videoRoomRepository.findOne({
      where: { id: roomId },
      relations: ['mission', 'creator'],
    });

    if (!room) {
      throw new NotFoundError('Video room not found');
    }

    return room;
  }

  async getRoomByMissionId(missionId: string): Promise<VideoRoom | null> {
    return await this.videoRoomRepository.findOne({
      where: { mission_id: missionId, is_active: true },
      relations: ['mission', 'creator'],
    });
  }

  async getOrCreateRoomForMission(missionId: string, userId: string): Promise<VideoRoom> {
    const existingRoom = await this.getRoomByMissionId(missionId);

    if (existingRoom) {
      return existingRoom;
    }

    return await this.createRoom(missionId, userId);
  }

  async endRoom(roomId: string): Promise<VideoRoom> {
    const room = await this.getRoomById(roomId);

    room.is_active = false;
    room.ended_at = new Date();

    await this.videoSessionRepository.update(
      { room_id: roomId, left_at: IsNull() },
      { left_at: new Date() }
    );

    return await this.videoRoomRepository.save(room);
  }

  async updateDelay(roomId: string, updateDelayDto: UpdateDelayDto): Promise<VideoRoom> {
    const room = await this.getRoomById(roomId);

    if (updateDelayDto.delay_seconds < 0) {
      throw new BadRequestError('Delay seconds cannot be negative');
    }

    if (updateDelayDto.delay_seconds > 3600) {
      throw new BadRequestError('Delay cannot exceed 1 hour (3600 seconds)');
    }

    room.delay_seconds = updateDelayDto.delay_seconds;
    room.delay_enabled = updateDelayDto.delay_enabled;

    return await this.videoRoomRepository.save(room);
  }

  async getDelayConfig(roomId: string): Promise<{ delay_seconds: number; delay_enabled: boolean }> {
    const room = await this.getRoomById(roomId);

    return {
      delay_seconds: room.delay_seconds,
      delay_enabled: room.delay_enabled,
    };
  }

  async joinRoom(roomId: string, userId: string, peerId: string): Promise<VideoSession> {
    const room = await this.getRoomById(roomId);

    if (!room.is_active) {
      throw new BadRequestError('Video room is not active');
    }

    const existingSession = await this.videoSessionRepository.findOne({
      where: { room_id: roomId, user_id: userId, left_at: IsNull() },
    });

    if (existingSession) {
      return existingSession;
    }

    const session = this.videoSessionRepository.create({
      room_id: roomId,
      user_id: userId,
      peer_id: peerId,
    });

    return await this.videoSessionRepository.save(session);
  }

  async leaveRoom(roomId: string, userId: string): Promise<void> {
    await this.videoSessionRepository.update(
      { room_id: roomId, user_id: userId, left_at: IsNull() },
      { left_at: new Date() }
    );
  }

  async getActiveSessions(roomId: string): Promise<VideoSession[]> {
    return await this.videoSessionRepository.find({
      where: { room_id: roomId, left_at: IsNull() },
      relations: ['user'],
    });
  }

  async getRoomHistory(missionId: string): Promise<VideoRoom[]> {
    return await this.videoRoomRepository.find({
      where: { mission_id: missionId },
      relations: ['creator', 'sessions'],
      order: { created_at: 'DESC' },
    });
  }
}

export const videoRoomService = new VideoRoomService();
