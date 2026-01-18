import type SimplePeer from 'simple-peer';

export interface VideoRoom {
  id: string;
  mission_id: string;
  room_name: string;
  is_active: boolean;
  max_participants: number;
  created_by?: string;
  created_at: string;
  ended_at?: string;
  delay_seconds: number;
  delay_enabled: boolean;
}

export interface VideoSession {
  id: string;
  room_id: string;
  user_id: string;
  peer_id: string;
  joined_at: string;
  left_at?: string;
  duration_seconds?: number;
}

export interface DelayConfig {
  enabled: boolean;
  delaySeconds: number;
  delayPreset?: DelayPreset;
}

export type DelayPreset = 
  | 'none'
  | 'moon'
  | 'mars_min'
  | 'mars_max'
  | 'custom';

export const DELAY_PRESETS: Record<DelayPreset, { label: string; seconds: number }> = {
  none: { label: 'Brak opóźnienia', seconds: 0 },
  moon: { label: 'Księżyc (~1.3s)', seconds: 1.3 },
  mars_min: { label: 'Mars minimum (~3 min)', seconds: 180 },
  mars_max: { label: 'Mars maximum (~22 min)', seconds: 1320 },
  custom: { label: 'Niestandardowe', seconds: 0 },
};

export interface Participant {
  userId: string;
  username: string;
  fullName: string;
  stream?: MediaStream;
  delayedStream?: MediaStream;
  peer?: SimplePeer.Instance;
  audioEnabled: boolean;
  videoEnabled: boolean;
}

export interface VideoCallState {
  room: VideoRoom | null;
  participants: Map<string, Participant>;
  localStream: MediaStream | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  delayConfig: DelayConfig;
}

export interface SocketUserPayload {
  userId: string;
  username: string;
  fullName: string;
}

export interface SocketSignalPayload {
  signal: SimplePeer.SignalData;
  targetUserId: string;
  roomId: string;
}

export interface SocketUserSignalPayload extends SocketUserPayload {
  signal: SimplePeer.SignalData;
}

export interface SocketReturnedSignalPayload {
  signal: SimplePeer.SignalData;
  userId: string;
}

export interface SocketMediaTogglePayload {
  userId: string;
  enabled: boolean;
}

export interface SocketDelayUpdatePayload {
  roomId: string;
  delaySeconds: number;
  enabled: boolean;
}

export interface VideoRoomResponse {
  success: boolean;
  data: VideoRoom;
}

export interface VideoSessionsResponse {
  success: boolean;
  data: VideoSession[];
}

export interface VideoRoomHistoryResponse {
  success: boolean;
  data: VideoRoom[];
}

export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'error';

export interface SignalPayload {
  signal: SimplePeer.SignalData;
  targetUserId: string;
  roomId: string;
}

export interface UserPayload {
  userId: string;
  username: string;
  fullName: string;
}

export interface UserSignalPayload extends UserPayload {
  signal: SimplePeer.SignalData;
}

export interface ReturnedSignalPayload {
  signal: SimplePeer.SignalData;
  userId: string;
}

export interface VideoCallContextType {
  state: VideoCallState;
  joinRoom: (roomId: string, missionId: string) => Promise<void>;
  leaveRoom: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  setDelay: (seconds: number) => void;
  toggleDelay: (enabled: boolean) => void;
  setDelayPreset: (preset: DelayPreset) => void;
}
