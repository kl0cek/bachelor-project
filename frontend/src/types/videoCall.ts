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
  peer?: any; // SimplePeer.Instance
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
