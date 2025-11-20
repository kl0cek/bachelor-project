import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import SimplePeer from 'simple-peer';
import type { VideoRoom, VideoCallState } from '../types/videoCall';

interface VideoCallContextType {
  state: VideoCallState;
  joinRoom: (roomId: string, missionId: string) => Promise<void>;
  leaveRoom: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
}

const VideoCallContext = createContext<VideoCallContextType | undefined>(undefined);

interface VideoCallProviderProps {
  children: ReactNode;
}

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://192.168.0.168:3000';

export const VideoCallProvider = ({ children }: VideoCallProviderProps) => {
  const [state, setState] = useState<VideoCallState>({
    room: null,
    participants: new Map(),
    localStream: null,
    isAudioEnabled: true,
    isVideoEnabled: true,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  const [socket, setSocket] = useState<Socket | null>(null);
  const [peers, setPeers] = useState<Map<string, SimplePeer.Instance>>(new Map());

  const getAccessToken = useCallback(() => {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'accessToken') {
        return value;
      }
    }
    return null;
  }, []);

  const createPeer = useCallback(
    (initiator: boolean, stream: MediaStream, targetUserId: string): SimplePeer.Instance => {
      const peer = new SimplePeer({
        initiator,
        trickle: false,
        stream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      });

      peer.on('signal', (signal) => {
        if (socket && state.room) {
          socket.emit('send-signal', {
            signal,
            targetUserId,
            roomId: state.room.id,
          });
        }
      });

      peer.on('stream', (remoteStream) => {
        setState((prev) => {
          const updatedParticipants = new Map(prev.participants);
          const participant = updatedParticipants.get(targetUserId);
          if (participant) {
            participant.stream = remoteStream;
            updatedParticipants.set(targetUserId, participant);
          }
          return { ...prev, participants: updatedParticipants };
        });
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
      });

      return peer;
    },
    [socket, state.room]
  );

  const joinRoom = useCallback(
    async (roomId: string, missionId: string) => {
      setState((prev) => ({ ...prev, isConnecting: true, error: null }));

      try {
        // Get user media
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        setState((prev) => ({ ...prev, localStream: stream }));

        // Connect to Socket.io
        const token = getAccessToken();
        const newSocket = io(SOCKET_URL, {
          auth: { token },
          transports: ['websocket', 'polling'],
        });

        setSocket(newSocket);

        newSocket.on('connect', () => {
          console.log('Connected to signaling server');
          newSocket.emit('join-room', { roomId, userId: 'current-user' });
        });

        // Handle existing users in room
        newSocket.on('existing-users', (existingUsers: any[]) => {
          const newPeers = new Map(peers);
          const newParticipants = new Map(state.participants);

          existingUsers.forEach((user) => {
            const peer = createPeer(true, stream, user.userId);
            newPeers.set(user.userId, peer);
            newParticipants.set(user.userId, {
              userId: user.userId,
              username: user.username,
              fullName: user.fullName,
              audioEnabled: true,
              videoEnabled: true,
              peer,
            });
          });

          setPeers(newPeers);
          setState((prev) => ({
            ...prev,
            participants: newParticipants,
            isConnected: true,
            isConnecting: false,
          }));
        });

        // Handle new user joining
        newSocket.on('user-joined', (user: any) => {
          console.log('User joined:', user);
        });

        // Handle incoming signal
        newSocket.on('user-signal', (data: any) => {
          const peer = createPeer(false, stream, data.userId);
          peer.signal(data.signal);

          setPeers((prev) => {
            const updated = new Map(prev);
            updated.set(data.userId, peer);
            return updated;
          });

          setState((prev) => {
            const updatedParticipants = new Map(prev.participants);
            updatedParticipants.set(data.userId, {
              userId: data.userId,
              username: data.username,
              fullName: data.fullName,
              audioEnabled: true,
              videoEnabled: true,
              peer,
            });
            return { ...prev, participants: updatedParticipants };
          });
        });

        // Handle return signal
        newSocket.on('receiving-returned-signal', (data: any) => {
          const peer = peers.get(data.userId);
          if (peer) {
            peer.signal(data.signal);
          }
        });

        // Handle user left
        newSocket.on('user-left', (data: any) => {
          const peer = peers.get(data.userId);
          if (peer) {
            peer.destroy();
          }

          setPeers((prev) => {
            const updated = new Map(prev);
            updated.delete(data.userId);
            return updated;
          });

          setState((prev) => {
            const updatedParticipants = new Map(prev.participants);
            updatedParticipants.delete(data.userId);
            return { ...prev, participants: updatedParticipants };
          });
        });

        setState((prev) => ({
          ...prev,
          room: { id: roomId, mission_id: missionId } as VideoRoom,
        }));
      } catch (error) {
        console.error('Failed to join room:', error);
        setState((prev) => ({
          ...prev,
          error: 'Failed to access camera/microphone',
          isConnecting: false,
        }));
      }
    },
    [createPeer, getAccessToken, peers, state.participants]
  );

  const leaveRoom = useCallback(() => {
    // Stop local stream
    if (state.localStream) {
      state.localStream.getTracks().forEach((track) => track.stop());
    }

    // Close all peer connections
    peers.forEach((peer) => peer.destroy());
    setPeers(new Map());

    // Disconnect socket
    if (socket) {
      if (state.room) {
        socket.emit('leave-room', state.room.id);
      }
      socket.disconnect();
      setSocket(null);
    }

    setState({
      room: null,
      participants: new Map(),
      localStream: null,
      isAudioEnabled: true,
      isVideoEnabled: true,
      isConnected: false,
      isConnecting: false,
      error: null,
    });
  }, [state.localStream, state.room, peers, socket]);

  const toggleAudio = useCallback(() => {
    if (state.localStream) {
      const audioTrack = state.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setState((prev) => ({ ...prev, isAudioEnabled: audioTrack.enabled }));
      }
    }
  }, [state.localStream]);

  const toggleVideo = useCallback(() => {
    if (state.localStream) {
      const videoTrack = state.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setState((prev) => ({ ...prev, isVideoEnabled: videoTrack.enabled }));
      }
    }
  }, [state.localStream]);

  useEffect(() => {
    return () => {
      leaveRoom();
    };
  }, []);

  return (
    <VideoCallContext.Provider value={{ state, joinRoom, leaveRoom, toggleAudio, toggleVideo }}>
      {children}
    </VideoCallContext.Provider>
  );
};

export const useVideoCall = () => {
  const context = useContext(VideoCallContext);
  if (!context) {
    throw new Error('useVideoCall must be used within VideoCallProvider');
  }
  return context;
};
