import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { io, Socket } from 'socket.io-client';
import SimplePeer from 'simple-peer/simplepeer.min.js';
import type {
  VideoRoom,
  VideoCallState,
  SocketSignalPayload,
  Participant,
} from '../types/videoCall';

// ============ Types ============
interface VideoCallContextType {
  state: VideoCallState;
  joinRoom: (roomId: string, missionId: string) => Promise<void>;
  leaveRoom: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
}

interface SignalPayload {
  signal: SimplePeer.SignalData;
  targetUserId: string;
  roomId: string;
}

interface UserPayload {
  userId: string;
  username: string;
  fullName: string;
}

interface UserSignalPayload extends UserPayload {
  signal: SimplePeer.SignalData;
}

interface ReturnedSignalPayload {
  signal: SimplePeer.SignalData;
  userId: string;
}

// ============ Constants ============
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://192.168.0.168:3000';

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

const INITIAL_STATE: VideoCallState = {
  room: null,
  participants: new Map(),
  localStream: null,
  isAudioEnabled: true,
  isVideoEnabled: true,
  isConnected: false,
  isConnecting: false,
  error: null,
};

// ============ Context ============
const VideoCallContext = createContext<VideoCallContextType | undefined>(undefined);

// ============ Helpers ============
const getAccessToken = (): string | null => {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'accessToken') {
      return value;
    }
  }
  return null;
};

// ============ Provider ============
interface VideoCallProviderProps {
  children: ReactNode;
}

export const VideoCallProvider = ({ children }: VideoCallProviderProps) => {
  const [state, setState] = useState<VideoCallState>(INITIAL_STATE);

  const socketRef = useRef<Socket | null>(null);
  const peersRef = useRef<Map<string, SimplePeer.Instance>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const roomIdRef = useRef<string | null>(null);
  const connectionStateRef = useRef<'idle' | 'connecting' | 'connected' | 'error'>('idle');

  const destroyPeer = useCallback((userId: string) => {
    const peer = peersRef.current.get(userId);
    if (peer) {
      peer.destroy();
      peersRef.current.delete(userId);
    }
  }, []);

  const createPeer = useCallback(
    (
      initiator: boolean,
      stream: MediaStream,
      targetUserId: string,
      incomingSignal?: SimplePeer.SignalData
    ): SimplePeer.Instance => {
      const peer = new SimplePeer({
        initiator,
        trickle: false,
        stream,
        config: { iceServers: ICE_SERVERS },
      });

      peer.on('signal', (signal: SocketSignalPayload['signal']) => {
        const socket = socketRef.current;
        const roomId = roomIdRef.current;

        if (!socket || !roomId || peer.destroyed) return;

        if (initiator) {
          socket.emit('send-signal', {
            signal,
            targetUserId,
            roomId,
          } satisfies SignalPayload);
        } else {
          socket.emit('return-signal', {
            signal,
            targetUserId,
            roomId,
          } satisfies SignalPayload);
        }
      });

      peer.on('stream', (remoteStream: Participant['stream']) => {
        setState((prev) => {
          const updatedParticipants = new Map(prev.participants);
          const participant = updatedParticipants.get(targetUserId);
          if (participant) {
            updatedParticipants.set(targetUserId, {
              ...participant,
              stream: remoteStream,
            });
          }
          return { ...prev, participants: updatedParticipants };
        });
      });

      peer.on('close', () => {
        console.log(`Peer connection closed: ${targetUserId}`);
        destroyPeer(targetUserId);
      });

      peer.on('error', (err: string) => {
        console.error(`Peer error (${targetUserId}):`, err);
      });

      if (incomingSignal) {
        peer.signal(incomingSignal);
      }

      peersRef.current.set(targetUserId, peer);
      return peer;
    },
    [destroyPeer]
  );

  const addParticipant = useCallback((user: UserPayload, peer: SimplePeer.Instance) => {
    setState((prev) => {
      const updatedParticipants = new Map(prev.participants);
      updatedParticipants.set(user.userId, {
        userId: user.userId,
        username: user.username,
        fullName: user.fullName,
        audioEnabled: true,
        videoEnabled: true,
        peer,
      });
      return { ...prev, participants: updatedParticipants };
    });
  }, []);

  const removeParticipant = useCallback(
    (userId: string) => {
      destroyPeer(userId);
      setState((prev) => {
        const updatedParticipants = new Map(prev.participants);
        updatedParticipants.delete(userId);
        return { ...prev, participants: updatedParticipants };
      });
    },
    [destroyPeer]
  );

  const setupSocketListeners = useCallback(
    (socket: Socket, stream: MediaStream) => {
      socket.on('existing-users', (existingUsers: UserPayload[]) => {
        console.log('Existing users in room:', existingUsers);

        existingUsers.forEach((user) => {
          if (peersRef.current.has(user.userId)) {
            console.log('Already have peer for:', user.userId);
            return;
          }
          const peer = createPeer(true, stream, user.userId);
          addParticipant(user, peer);
        });

        connectionStateRef.current = 'connected';
        setState((prev) => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
        }));
      });

      socket.on('user-joined', (user: UserPayload) => {
        console.log('User joined:', user);
      });

      socket.on('user-signal', (data: UserSignalPayload) => {
        console.log('Received signal from:', data.userId);

        if (peersRef.current.has(data.userId)) {
          console.log('Already have peer for user, ignoring signal:', data.userId);
          return;
        }

        const peer = createPeer(false, stream, data.userId, data.signal);
        addParticipant(
          {
            userId: data.userId,
            username: data.username,
            fullName: data.fullName,
          },
          peer
        );
      });

      socket.on('receiving-returned-signal', (data: ReturnedSignalPayload) => {
        console.log('Received return signal from:', data.userId);
        const peer = peersRef.current.get(data.userId);
        if (peer && !peer.destroyed) {
          try {
            peer.signal(data.signal);
          } catch (e) {
            console.warn('Failed to signal peer with return signal:', e);
          }
        }
      });

      socket.on('user-left', (data: { userId: string }) => {
        console.log('User left:', data.userId);
        removeParticipant(data.userId);
      });

      socket.on('user-toggled-audio', (data: { userId: string; enabled: boolean }) => {
        setState((prev) => {
          const updatedParticipants = new Map(prev.participants);
          const participant = updatedParticipants.get(data.userId);
          if (participant) {
            updatedParticipants.set(data.userId, {
              ...participant,
              audioEnabled: data.enabled,
            });
          }
          return { ...prev, participants: updatedParticipants };
        });
      });

      socket.on('user-toggled-video', (data: { userId: string; enabled: boolean }) => {
        setState((prev) => {
          const updatedParticipants = new Map(prev.participants);
          const participant = updatedParticipants.get(data.userId);
          if (participant) {
            updatedParticipants.set(data.userId, {
              ...participant,
              videoEnabled: data.enabled,
            });
          }
          return { ...prev, participants: updatedParticipants };
        });
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        if (connectionStateRef.current === 'connecting') {
          connectionStateRef.current = 'error';
          setState((prev) => ({
            ...prev,
            error: `Connection failed: ${error.message}`,
            isConnecting: false,
          }));
        }
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });
    },
    [createPeer, addParticipant, removeParticipant]
  );

  // Full cleanup - resets everything including connection state
  const fullCleanup = useCallback(() => {
    console.log('Full cleanup called');

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    peersRef.current.forEach((peer) => peer.destroy());
    peersRef.current.clear();

    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      if (roomIdRef.current) {
        socketRef.current.emit('leave-room', roomIdRef.current);
      }
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    roomIdRef.current = null;
    connectionStateRef.current = 'idle';
  }, []);

  const joinRoom = useCallback(
    async (roomId: string, missionId: string) => {
      if (connectionStateRef.current !== 'idle') {
        console.warn('Already connecting or connected, state:', connectionStateRef.current);
        return;
      }

      connectionStateRef.current = 'connecting';
      setState((prev) => ({ ...prev, isConnecting: true, error: null }));

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        localStreamRef.current = stream;
        roomIdRef.current = roomId;

        setState((prev) => ({ ...prev, localStream: stream }));

        const token = getAccessToken();
        const socket = io(SOCKET_URL, {
          auth: { token },
          transports: ['websocket', 'polling'],
          withCredentials: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 10000,
        });

        socketRef.current = socket;
        setupSocketListeners(socket, stream);

        socket.on('connect', () => {
          console.log('Connected to signaling server');
          socket.emit('join-room', { roomId });
        });

        setState((prev) => ({
          ...prev,
          room: { id: roomId, mission_id: missionId } as VideoRoom,
        }));
      } catch (error) {
        console.error('Failed to join room:', error);
        fullCleanup();
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to access camera/microphone',
          isConnecting: false,
        }));
      }
    },
    [setupSocketListeners, fullCleanup]
  );

  const leaveRoom = useCallback(() => {
    fullCleanup();
    setState(INITIAL_STATE);
  }, [fullCleanup]);

  const toggleAudio = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;

      const socket = socketRef.current;
      const roomId = roomIdRef.current;
      if (socket && roomId) {
        socket.emit('toggle-audio', { roomId, enabled: audioTrack.enabled });
      }

      setState((prev) => ({ ...prev, isAudioEnabled: audioTrack.enabled }));
    }
  }, []);

  const toggleVideo = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;

      const socket = socketRef.current;
      const roomId = roomIdRef.current;
      if (socket && roomId) {
        socket.emit('toggle-video', { roomId, enabled: videoTrack.enabled });
      }

      setState((prev) => ({ ...prev, isVideoEnabled: videoTrack.enabled }));
    }
  }, []);

  // Provider-level cleanup - only on true unmount
  // Don't cleanup on StrictMode remount - connection stays alive
  useEffect(() => {
    const handleBeforeUnload = () => {
      fullCleanup();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [fullCleanup]);

  return (
    <VideoCallContext.Provider value={{ state, joinRoom, leaveRoom, toggleAudio, toggleVideo }}>
      {children}
    </VideoCallContext.Provider>
  );
};

export const useVideoCall = (): VideoCallContextType => {
  const context = useContext(VideoCallContext);
  if (!context) {
    throw new Error('useVideoCall must be used within VideoCallProvider');
  }
  return context;
};
