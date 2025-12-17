import { createContext } from 'react';
import type { VideoCallState } from '../types/videoCall';
interface VideoCallContextType {
  state: VideoCallState;
  joinRoom: (roomId: string, missionId: string) => Promise<void>;
  leaveRoom: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
}

export const VideoCallContext = createContext<VideoCallContextType | undefined>(undefined);
