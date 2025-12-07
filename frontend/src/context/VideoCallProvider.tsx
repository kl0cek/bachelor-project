import { useState, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import type { VideoCallState, VideoRoom, ConnectionState } from '../types/videoCall';
import { SOCKET_URL, INITIAL_STATE, SOCKET_OPTIONS } from '../constants/videoCall';
import { getAccessToken, getMediaStream } from '../utils/videoCall';
import { usePeerConnection } from '../hooks/usePeerConnection';
import { useSocketListeners } from '../hooks/useSocketListeners';
import { VideoCallContext } from './VideoCallContext';

interface VideoCallProviderProps {
  children: ReactNode;
}

export function VideoCallProvider({ children }: VideoCallProviderProps) {
  const [state, setState] = useState<VideoCallState>(INITIAL_STATE);

  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const roomIdRef = useRef<string | null>(null);
  const connectionStateRef = useRef<ConnectionState>('idle');

  const { createPeer, addParticipant, removeParticipant, destroyAllPeers, hasPeer, getPeer } =
    usePeerConnection({
      socketRef,
      roomIdRef,
      setState,
    });

  const { setupSocketListeners } = useSocketListeners({
    connectionStateRef,
    setState,
    createPeer,
    addParticipant,
    removeParticipant,
    hasPeer,
    getPeer,
  });

  const fullCleanup = useCallback(() => {
    console.log('Full cleanup called');

    if (localStreamRef.current) {
      console.log('Stopping local stream tracks');
      localStreamRef.current.getTracks().forEach((track) => {
        console.log(`Stopping ${track.kind} track`);
        track.stop();
      });
      localStreamRef.current = null;
    }

    destroyAllPeers();

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
  }, [destroyAllPeers]);

  const joinRoom = useCallback(
    async (roomId: string, missionId: string) => {
      if (connectionStateRef.current !== 'idle') {
        console.warn('Already connecting or connected, state:', connectionStateRef.current);
        return;
      }

      if (localStreamRef.current || socketRef.current) {
        console.log('Cleaning up existing connection before joining');
        fullCleanup();
      }

      connectionStateRef.current = 'connecting';
      setState((prev) => ({ ...prev, isConnecting: true, error: null }));

      try {
        const stream = await getMediaStream();

        localStreamRef.current = stream;
        roomIdRef.current = roomId;

        setState((prev) => ({ ...prev, localStream: stream }));

        const token = getAccessToken();
        const socket = io(SOCKET_URL, {
          auth: { token },
          ...SOCKET_OPTIONS,
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
    console.log('Leave room called');
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

  useEffect(() => {
    const handleBeforeUnload = () => {
      fullCleanup();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      fullCleanup();
    };
  }, [fullCleanup]);

  return (
    <VideoCallContext.Provider value={{ state, joinRoom, leaveRoom, toggleAudio, toggleVideo }}>
      {children}
    </VideoCallContext.Provider>
  );
}
