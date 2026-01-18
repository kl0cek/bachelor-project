import { useState, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import type { 
  VideoCallState, 
  VideoRoom, 
  ConnectionState, 
  DelayPreset
} from '../types/videoCall';
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

        socket.on('room-delay-update', (data: { delaySeconds: number; enabled: boolean }) => {
          setState((prev) => ({
            ...prev,
            delayConfig: {
              ...prev.delayConfig,
              delaySeconds: data.delaySeconds,
              enabled: data.enabled,
              delayPreset: 'custom',
            },
          }));
        });

        socket.on('room-delay-config', (data: { delaySeconds: number; enabled: boolean }) => {
          setState((prev) => ({
            ...prev,
            delayConfig: {
              enabled: data.enabled,
              delaySeconds: data.delaySeconds,
              delayPreset: data.delaySeconds > 0 ? 'custom' : 'none',
            },
          }));
        });

        setState((prev) => ({
          ...prev,
          room: { 
            id: roomId, 
            mission_id: missionId,
            room_name: `Mission ${missionId} Video Call`,
            is_active: true,
            max_participants: 10,
            delay_seconds: 0,
            delay_enabled: false,
            created_at: new Date().toISOString(),
          } as VideoRoom,
        }));

        try {
          const apiUrl = import.meta.env.VITE_API_URL || '';
          const response = await fetch(`${apiUrl}/video-rooms/mission/${missionId}`, {
            credentials: 'include',
          });
          
          if (response.ok) {
            const roomData = await response.json();
            if (roomData.success && roomData.data) {
              const room = roomData.data as VideoRoom;
              setState((prev) => ({
                ...prev,
                room,
                delayConfig: {
                  enabled: room.delay_enabled ?? false,
                  delaySeconds: room.delay_seconds ?? 0,
                  delayPreset: room.delay_seconds > 0 ? 'custom' : 'none',
                },
              }));
            }
          }
        } catch (fetchError) {
          console.warn('Could not fetch room data, using defaults:', fetchError);
        }
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

  const setDelay = useCallback((seconds: number) => {
    const socket = socketRef.current;
    const roomId = roomIdRef.current;

    setState((prev) => ({
      ...prev,
      delayConfig: {
        ...prev.delayConfig,
        delaySeconds: seconds,
        delayPreset: 'custom',
      },
    }));

    if (socket && roomId) {
      socket.emit('update-delay', { 
        roomId, 
        delaySeconds: seconds,
        enabled: state.delayConfig.enabled,
      });
    }

    if (state.room?.id) {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      fetch(`${apiUrl}/video-rooms/${state.room.id}/delay`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          delay_seconds: seconds,
          delay_enabled: state.delayConfig.enabled,
        }),
      }).catch(console.error);
    }
  }, [state.delayConfig.enabled, state.room?.id]);

  const toggleDelay = useCallback((enabled: boolean) => {
    const socket = socketRef.current;
    const roomId = roomIdRef.current;

    setState((prev) => ({
      ...prev,
      delayConfig: {
        ...prev.delayConfig,
        enabled,
      },
    }));

    if (socket && roomId) {
      socket.emit('update-delay', { 
        roomId, 
        delaySeconds: state.delayConfig.delaySeconds,
        enabled,
      });
    }

    if (state.room?.id) {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      fetch(`${apiUrl}/video-rooms/${state.room.id}/delay`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          delay_seconds: state.delayConfig.delaySeconds,
          delay_enabled: enabled,
        }),
      }).catch(console.error);
    }
  }, [state.delayConfig.delaySeconds, state.room?.id]);

  const setDelayPreset = useCallback((preset: DelayPreset) => {
    const presetConfig = {
      none: { label: 'Brak opóźnienia', seconds: 0 },
      moon: { label: 'Księżyc (~1.3s)', seconds: 1.3 },
      mars_min: { label: 'Mars minimum (~3 min)', seconds: 180 },
      mars_max: { label: 'Mars maximum (~22 min)', seconds: 1320 },
      custom: { label: 'Niestandardowe', seconds: state.delayConfig.delaySeconds },
    };

    const seconds = presetConfig[preset].seconds;
    const enabled = preset !== 'none';

    setState((prev) => ({
      ...prev,
      delayConfig: {
        enabled,
        delaySeconds: seconds,
        delayPreset: preset,
      },
    }));

    const socket = socketRef.current;
    const roomId = roomIdRef.current;

    if (socket && roomId) {
      socket.emit('update-delay', { roomId, delaySeconds: seconds, enabled });
    }

    if (state.room?.id) {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      fetch(`${apiUrl}/video-rooms/${state.room.id}/delay`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          delay_seconds: seconds,
          delay_enabled: enabled,
        }),
      }).catch(console.error);
    }
  }, [state.delayConfig.delaySeconds, state.room?.id]);

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
    <VideoCallContext.Provider 
      value={{ 
        state, 
        joinRoom, 
        leaveRoom, 
        toggleAudio, 
        toggleVideo,
        setDelay,
        toggleDelay,
        setDelayPreset,
      }}
    >
      {children}
    </VideoCallContext.Provider>
  );
}
