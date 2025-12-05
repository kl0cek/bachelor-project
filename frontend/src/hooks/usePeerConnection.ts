import { useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import SimplePeer from 'simple-peer/simplepeer.min.js';
import type { VideoCallState, SignalPayload, UserPayload } from '../types/videoCall';
import { ICE_SERVERS } from '../constants/videoCall';

interface UsePeerConnectionProps {
  socketRef: React.RefObject<Socket | null>;
  roomIdRef: React.RefObject<string | null>;
  setState: React.Dispatch<React.SetStateAction<VideoCallState>>;
}

export function usePeerConnection({ socketRef, roomIdRef, setState }: UsePeerConnectionProps) {
  const peersRef = useRef<Map<string, SimplePeer.Instance>>(new Map());

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

      peer.on('signal', (signal: SimplePeer.SignalData) => {
        const socket = socketRef.current;
        const roomId = roomIdRef.current;

        if (!socket || !roomId || peer.destroyed) return;

        const payload: SignalPayload = {
          signal,
          targetUserId,
          roomId,
        };

        if (initiator) {
          socket.emit('send-signal', payload);
        } else {
          socket.emit('return-signal', payload);
        }
      });

      peer.on('stream', (remoteStream: MediaStream) => {
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
    [socketRef, roomIdRef, setState, destroyPeer]
  );

  const addParticipant = useCallback(
    (user: UserPayload, peer: SimplePeer.Instance) => {
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
    },
    [setState]
  );

  const removeParticipant = useCallback(
    (userId: string) => {
      destroyPeer(userId);
      setState((prev) => {
        const updatedParticipants = new Map(prev.participants);
        updatedParticipants.delete(userId);
        return { ...prev, participants: updatedParticipants };
      });
    },
    [destroyPeer, setState]
  );

  const destroyAllPeers = useCallback(() => {
    peersRef.current.forEach((peer) => peer.destroy());
    peersRef.current.clear();
  }, []);

  const hasPeer = useCallback((userId: string): boolean => {
    return peersRef.current.has(userId);
  }, []);

  const getPeer = useCallback((userId: string): SimplePeer.Instance | undefined => {
    return peersRef.current.get(userId);
  }, []);

  return {
    peersRef,
    createPeer,
    destroyPeer,
    addParticipant,
    removeParticipant,
    destroyAllPeers,
    hasPeer,
    getPeer,
  };
}
