import type { VideoCallState } from '../types/videoCall';

export const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://192.168.0.100:3000';

export const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export const INITIAL_STATE: VideoCallState = {
  room: null,
  participants: new Map(),
  localStream: null,
  isAudioEnabled: true,
  isVideoEnabled: true,
  isConnected: false,
  isConnecting: false,
  error: null,
};

export const SOCKET_OPTIONS = {
  transports: ['websocket', 'polling'],
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
};
