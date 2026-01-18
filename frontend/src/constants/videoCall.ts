import type { VideoCallState, DelayConfig } from '../types/videoCall';

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://localhost:3000';

export const DEFAULT_DELAY_CONFIG: DelayConfig = {
  enabled: false,
  delaySeconds: 0,
  delayPreset: 'none',
};

export const INITIAL_STATE: VideoCallState = {
  room: null,
  participants: new Map(),
  localStream: null,
  isAudioEnabled: true,
  isVideoEnabled: true,
  isConnected: false,
  isConnecting: false,
  error: null,
  delayConfig: {
    enabled: false,
    delaySeconds: 0,
    delayPreset: 'none',
  },
};

export const SOCKET_OPTIONS = {
  withCredentials: true,
  transports: ['websocket', 'polling'] as ('websocket' | 'polling')[],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
};

export const MEDIA_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    width: { ideal: 1280, max: 1920 },
    height: { ideal: 720, max: 1080 },
    facingMode: 'user',
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
};

export const ICE_SERVERS: RTCIceServer[] = 
  [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ];