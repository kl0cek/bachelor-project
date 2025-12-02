import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { AppDataSource } from './database';
import { User } from '../entities/User.entity';
import { logger } from './logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: User;
}

interface SignalData {
  signal: any;
  targetUserId: string;
  roomId: string;
}

interface JoinRoomData {
  roomId: string;
  userId: string;
}

let io: Server | null = null;

export const initializeSocket = (httpServer: HTTPServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.headers.cookie
        ?.split(';')
        .find(c => c.trim().startsWith('accessToken='))
        ?.split('=')[1];

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return next(new Error('JWT_SECRET not configured'));
      }

      const decoded = jwt.verify(token, jwtSecret) as { userId: string };
      
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: decoded.userId, is_active: true },
      });

      if (!user) {
        return next(new Error('Authentication error: Invalid user'));
      }

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`User connected: ${socket.userId} (${socket.user?.username})`);

    socket.on('join-room', async (data: JoinRoomData) => {
      const { roomId } = data;
      
      socket.join(roomId);
      logger.info(`User ${socket.userId} joined room ${roomId}`);

      socket.to(roomId).emit('user-joined', {
        userId: socket.userId,
        username: socket.user?.username,
        fullName: socket.user?.full_name,
      });

      const socketsInRoom = await io!.in(roomId).fetchSockets();
      const existingUsers = socketsInRoom
        .filter((s: any) => s.userId !== socket.userId)
        .map((s: any) => ({
          userId: s.userId,
          username: s.user?.username,
          fullName: s.user?.full_name,
        }));

      socket.emit('existing-users', existingUsers);
      
      logger.info(`Sent ${existingUsers.length} existing users to ${socket.userId}`);
    });

    socket.on('send-signal', (data: SignalData) => {
      const { signal, targetUserId, roomId } = data;
      
      const sockets = Array.from(io!.sockets.sockets.values());
      const targetSocket = sockets.find((s: any) => s.userId === targetUserId);
      
      if (targetSocket) {
        targetSocket.emit('user-signal', {
          signal,
          userId: socket.userId,
          username: socket.user?.username,
          fullName: socket.user?.full_name,
        });
      }
    });

    socket.on('return-signal', (data: SignalData) => {
      const { signal, targetUserId, roomId } = data;

      // find target socket and emit only to them
      const sockets = Array.from(io!.sockets.sockets.values());
      const targetSocket = sockets.find((s: any) => s.userId === targetUserId);

      if (targetSocket) {
        targetSocket.emit('receiving-returned-signal', {
          signal,
          userId: socket.userId,
        });
      } else {
        logger.warn(`Could not find target socket for return-signal: ${targetUserId}`);
      }
    });

    socket.on('leave-room', (roomId: string) => {
      socket.leave(roomId);
      socket.to(roomId).emit('user-left', {
        userId: socket.userId,
      });
      logger.info(`User ${socket.userId} left room ${roomId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.userId}`);
      socket.rooms.forEach((roomId) => {
        if (roomId !== socket.id) {
          socket.to(roomId).emit('user-left', {
            userId: socket.userId,
          });
        }
      });
    });
    socket.on('toggle-audio', (data: { roomId: string; enabled: boolean }) => {
      socket.to(data.roomId).emit('user-toggled-audio', {
        userId: socket.userId,
        enabled: data.enabled,
      });
    });

    socket.on('toggle-video', (data: { roomId: string; enabled: boolean }) => {
      socket.to(data.roomId).emit('user-toggled-video', {
        userId: socket.userId,
        enabled: data.enabled,
      });
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
