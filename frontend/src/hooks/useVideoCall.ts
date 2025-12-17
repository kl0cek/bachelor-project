import { useContext } from 'react';
import type { VideoCallContextType } from '../types/videoCall';
import { VideoCallContext } from '../context/VideoCallContext';

export function useVideoCall(): VideoCallContextType {
  const context = useContext(VideoCallContext);
  if (!context) {
    throw new Error('useVideoCall must be used within VideoCallProvider');
  }
  return context;
}
