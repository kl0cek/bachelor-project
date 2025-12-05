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

export interface Participant {
  userId: string;
  username: string;
  fullName: string;
  stream?: MediaStream;
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
}
