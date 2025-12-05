import { useCallback } from 'react';
import { Socket } from 'socket.io-client';
import SimplePeer from 'simple-peer/simplepeer.min.js';
import type {
  VideoCallState,
  UserPayload,
  UserSignalPayload,
  ReturnedSignalPayload,
  ConnectionState,
} from '../types/videoCall';

interface UseSocketListenersProps {
  connectionStateRef: React.RefObject<ConnectionState>;
  setState: React.Dispatch<React.SetStateAction<VideoCallState>>;
  createPeer: (
    initiator: boolean,
    stream: MediaStream,
    targetUserId: string,
    incomingSignal?: SimplePeer.SignalData
  ) => SimplePeer.Instance;
  addParticipant: (user: UserPayload, peer: SimplePeer.Instance) => void;
  removeParticipant: (userId: string) => void;
  hasPeer: (userId: string) => boolean;
  getPeer: (userId: string) => SimplePeer.Instance | undefined;
}

export function useSocketListeners({
  connectionStateRef,
  setState,
  createPeer,
  addParticipant,
  removeParticipant,
  hasPeer,
  getPeer,
}: UseSocketListenersProps) {
  const setupSocketListeners = useCallback(
    (socket: Socket, stream: MediaStream) => {
      socket.on('existing-users', (existingUsers: UserPayload[]) => {
        console.log('Existing users in room:', existingUsers);

        existingUsers.forEach((user) => {
          if (hasPeer(user.userId)) {
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

        if (hasPeer(data.userId)) {
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
        const peer = getPeer(data.userId);
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
    [connectionStateRef, setState, createPeer, addParticipant, removeParticipant, hasPeer, getPeer]
  );

  return { setupSocketListeners };
}
