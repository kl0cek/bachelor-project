import { createContext } from 'react';
import type { VideoCallState, DelayPreset } from '../types/videoCall';

interface VideoCallContextType {
  state: VideoCallState;
  joinRoom: (roomId: string, missionId: string) => Promise<void>;
  leaveRoom: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  setDelay: (seconds: number) => void;
  toggleDelay: (enabled: boolean) => void;
  setDelayPreset: (preset: DelayPreset) => void;
}

export const VideoCallContext = createContext<VideoCallContextType | undefined>(undefined);
