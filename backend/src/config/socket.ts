import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { AppDataSource } from './database';
import { User } from '../entities/User.entity';
import { VideoRoom } from '../entities/VideoRoom.entity';
import { logger } from './logger';

interface AuthenticatedSocket extends Socket {
  userId: string;
  user: User;
}

interface SignalData {
  signal: unknown;
  targetUserId: string;
  roomId: string;
}

interface JoinRoomData {
  roomId: string;
}

interface ToggleMediaData {
  roomId: string;
  enabled: boolean;
}

interface UpdateDelayData {
  roomId: string;
  delaySeconds: number;
  enabled: boolean;
}

interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

function isAuthenticatedSocket(socket: Socket): socket is AuthenticatedSocket {
  return 'userId' in socket && 'user' in socket;
}

let io: Server | null = null;

function extractToken(socket: Socket): string | null {
  const authToken = socket.handshake.auth?.token;
  if (authToken && typeof authToken === 'string') {
    return authToken;
  }

  const cookieHeader = socket.handshake.headers.cookie;
  if (cookieHeader) {
    const accessTokenCookie = cookieHeader
      .split(';')
      .find((c) => c.trim().startsWith('accessToken='));

    if (accessTokenCookie) {
      return accessTokenCookie.split('=')[1];
    }
  }

  return null;
}

function getOtherSocketsInRoom(roomId: string, excludeSocketId: string): AuthenticatedSocket[] {
  if (!io) return [];

  const room = io.sockets.adapter.rooms.get(roomId);
  if (!room) return [];

  const sockets: AuthenticatedSocket[] = [];

  for (const socketId of room) {
    if (socketId === excludeSocketId) continue;

    const socket = io.sockets.sockets.get(socketId);
    if (socket && isAuthenticatedSocket(socket)) {
      sockets.push(socket);
    }
  }

  return sockets;
}

function findSocketByUserId(userId: string): AuthenticatedSocket | null {
  if (!io) return null;

  for (const [, socket] of io.sockets.sockets) {
    if (isAuthenticatedSocket(socket) && socket.userId === userId) {
      return socket;
    }
  }

  return null;
}

async function getRoomDelayConfig(roomId: string): Promise<{ delaySeconds: number; enabled: boolean } | null> {
  try {
    const videoRoomRepository = AppDataSource.getRepository(VideoRoom);
    
    const missionId = roomId.replace('mission-', '');
    
    const room = await videoRoomRepository.findOne({
      where: { mission_id: missionId, is_active: true },
    });

    if (room) {
      return {
        delaySeconds: room.delay_seconds,
        enabled: room.delay_enabled,
      };
    }

    return null;
  } catch (error) {
    logger.error('Error getting room delay config:', error);
    return null;
  }
}

async function updateRoomDelayConfig(
  roomId: string, 
  delaySeconds: number, 
  enabled: boolean
): Promise<boolean> {
  try {
    const videoRoomRepository = AppDataSource.getRepository(VideoRoom);
    
    const missionId = roomId.replace('mission-', '');
    
    const room = await videoRoomRepository.findOne({
      where: { mission_id: missionId, is_active: true },
    });

    if (room) {
      room.delay_seconds = delaySeconds;
      room.delay_enabled = enabled;
      await videoRoomRepository.save(room);
      return true;
    }

    return false;
  } catch (error) {
    logger.error('Error updating room delay config:', error);
    return false;
  }
}

export const initializeSocket = (httpServer: HTTPServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['https://192.168.0.100:5173'],
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.use(async (socket, next) => {
    try {
      const token = extractToken(socket);

      if (!token) {
        logger.warn('Socket connection attempt without token');
        return next(new Error('Authentication error: No token provided'));
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        logger.error('JWT_SECRET not configured');
        return next(new Error('Server configuration error'));
      }

      let decoded: JWTPayload;
      try {
        decoded = jwt.verify(token, jwtSecret) as JWTPayload;
      } catch (jwtError) {
        logger.warn('Invalid JWT token:', jwtError);
        return next(new Error('Authentication error: Invalid token'));
      }

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: decoded.userId, is_active: true },
      });

      if (!user) {
        logger.warn(`User not found or inactive: ${decoded.userId}`);
        return next(new Error('Authentication error: Invalid user'));
      }

      (socket as AuthenticatedSocket).userId = user.id;
      (socket as AuthenticatedSocket).user = user;

      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (rawSocket: Socket) => {
    if (!isAuthenticatedSocket(rawSocket)) {
      logger.error('Socket connected but not authenticated');
      rawSocket.disconnect();
      return;
    }

    const socket = rawSocket;
    logger.info(`User connected: ${socket.userId} (${socket.user.username})`);

    socket.on('join-room', async (data: JoinRoomData) => {
      const { roomId } = data;

      socket.join(roomId);
      logger.info(`User ${socket.userId} (${socket.user.username}) joined room ${roomId}`);

      socket.to(roomId).emit('user-joined', {
        userId: socket.userId,
        username: socket.user.username,
        fullName: socket.user.full_name,
      });

      const existingUsers = getOtherSocketsInRoom(roomId, socket.id).map((s) => ({
        userId: s.userId,
        username: s.user.username,
        fullName: s.user.full_name,
      }));

      socket.emit('existing-users', existingUsers);
      logger.info(`Sent ${existingUsers.length} existing users to ${socket.userId}`);

      const delayConfig = await getRoomDelayConfig(roomId);
      if (delayConfig) {
        socket.emit('room-delay-config', delayConfig);
        logger.info(`Sent delay config to ${socket.userId}: ${delayConfig.delaySeconds}s, enabled: ${delayConfig.enabled}`);
      }
    });

    socket.on('send-signal', (data: SignalData) => {
      const { signal, targetUserId } = data;

      const targetSocket = findSocketByUserId(targetUserId);
      if (targetSocket) {
        targetSocket.emit('user-signal', {
          signal,
          userId: socket.userId,
          username: socket.user.username,
          fullName: socket.user.full_name,
        });
        logger.debug(`Signal sent from ${socket.userId} to ${targetUserId}`);
      } else {
        logger.warn(`Target socket not found for signal: ${targetUserId}`);
      }
    });

    socket.on('return-signal', (data: SignalData) => {
      const { signal, targetUserId } = data;

      const targetSocket = findSocketByUserId(targetUserId);
      if (targetSocket) {
        targetSocket.emit('receiving-returned-signal', {
          signal,
          userId: socket.userId,
        });
        logger.debug(`Return signal sent from ${socket.userId} to ${targetUserId}`);
      } else {
        logger.warn(`Target socket not found for return signal: ${targetUserId}`);
      }
    });

    socket.on('leave-room', (roomId: string) => {
      socket.leave(roomId);
      socket.to(roomId).emit('user-left', { userId: socket.userId });
      logger.info(`User ${socket.userId} left room ${roomId}`);
    });

    socket.on('toggle-audio', (data: ToggleMediaData) => {
      socket.to(data.roomId).emit('user-toggled-audio', {
        userId: socket.userId,
        enabled: data.enabled,
      });
    });

    socket.on('toggle-video', (data: ToggleMediaData) => {
      socket.to(data.roomId).emit('user-toggled-video', {
        userId: socket.userId,
        enabled: data.enabled,
      });
    });

    socket.on('update-delay', async (data: UpdateDelayData) => {
      const { roomId, delaySeconds, enabled } = data;

      const success = await updateRoomDelayConfig(roomId, delaySeconds, enabled);
      
      if (success) {
        io?.to(roomId).emit('room-delay-update', {
          delaySeconds,
          enabled,
          updatedBy: socket.userId,
        });
        
        logger.info(`User ${socket.userId} updated delay for room ${roomId}: ${delaySeconds}s, enabled: ${enabled}`);
      } else {
        socket.emit('delay-update-error', { 
          message: 'Failed to update delay configuration' 
        });
      }
    });

    socket.on('get-delay-config', async (roomId: string) => {
      const delayConfig = await getRoomDelayConfig(roomId);
      if (delayConfig) {
        socket.emit('room-delay-config', delayConfig);
      }
    });

    socket.on('disconnect', (reason) => {
      logger.info(`User disconnected: ${socket.userId}, reason: ${reason}`);

      socket.rooms.forEach((roomId) => {
        if (roomId !== socket.id) {
          socket.to(roomId).emit('user-left', { userId: socket.userId });
        }
      });
    });

    socket.on('error', (error) => {
      logger.error(`Socket error for user ${socket.userId}:`, error);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initializeSocket first.');
  }
  return io;
};

export const isSocketInitialized = (): boolean => {
  return io !== null;
};

export const broadcastDelayUpdate = (roomId: string, delaySeconds: number, enabled: boolean) => {
  if (io) {
    io.to(roomId).emit('room-delay-update', { delaySeconds, enabled });
  }
};
