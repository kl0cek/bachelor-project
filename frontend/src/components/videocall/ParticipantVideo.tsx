import { useRef, useEffect, useState, memo } from 'react';
import { MicOff, VideoOff, Loader2, Clock } from 'lucide-react';
import type { Participant, DelayConfig } from '../../types/videoCall';
import { BufferingIndicator } from './DelayControls';
import { useDelayedStream } from '../../hooks/useDelayedStream';

interface ParticipantVideoProps {
  participant: Participant;
  delayConfig: DelayConfig;
}

export const ParticipantVideo = memo(({ participant, delayConfig }: ParticipantVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const delayMs = delayConfig.enabled ? delayConfig.delaySeconds * 1000 : 0;

  const { 
    delayedStream, 
    isBuffering, 
    bufferProgress, 
    startDelay, 
    stopDelay 
  } = useDelayedStream({
    delayMs,
    enabled: delayConfig.enabled && delayConfig.delaySeconds > 0,
  });

  useEffect(() => {
    if (participant.stream) {
      console.log('Starting delay for participant:', participant.userId);
      startDelay(participant.stream);
    }

    return () => {
      stopDelay();
    };
  }, [participant.stream, participant.userId, startDelay, stopDelay]);

  useEffect(() => {
    const videoElement = videoRef.current;
    const streamToUse = delayedStream;

    if (!videoElement) return;

    if (!streamToUse) {
      videoElement.srcObject = null;
      setIsPlaying(false);
      return;
    }

    setVideoError(false);
    videoElement.srcObject = streamToUse;

    const playVideo = async () => {
      try {
        await videoElement.play();
        setIsPlaying(true);
        console.log('Participant video playing');
      } catch (err) {
        const error = err as Error;
        if (error.name !== 'AbortError') {
          console.warn('Video play failed:', error);
          setVideoError(true);
        }
      }
    };

    if (videoElement.readyState >= 2) {
      playVideo();
    } else {
      videoElement.onloadeddata = () => playVideo();
    }

    return () => {
      if (videoElement) {
        videoElement.onloadeddata = null;
      }
    };
  }, [delayedStream]);

  const displayName = participant.fullName || participant.username || 'Unknown';
  const initials = displayName.charAt(0).toUpperCase();

  const showDelayIndicator = delayConfig.enabled && delayConfig.delaySeconds > 0 && !isBuffering && isPlaying;
  const showBuffering = isBuffering && delayConfig.enabled && delayConfig.delaySeconds > 0;

  return (
    <div className="relative bg-slate-800 rounded-lg overflow-hidden aspect-video">
      {delayedStream && !videoError ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={false}
          className="w-full h-full object-cover transform scale-x-[-1]"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-700">
          <div className="text-center">
            <div className="h-16 w-16 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-white">{initials}</span>
            </div>
            {!participant.stream && (
              <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" />
            )}
          </div>
        </div>
      )}

      {showBuffering && (
        <BufferingIndicator 
          isBuffering={true} 
          progress={bufferProgress}
          delaySeconds={delayConfig.delaySeconds}
        />
      )}

      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <div className="bg-slate-900/80 px-3 py-1 rounded-lg">
          <p className="text-white text-sm font-medium">{displayName}</p>
        </div>
        {showDelayIndicator && (
          <div className="bg-blue-600/80 px-2 py-1 rounded-lg flex items-center gap-1">
            <Clock className="h-3 w-3 text-white" />
            <span className="text-white text-xs">
              {delayConfig.delaySeconds < 60 
                ? `${delayConfig.delaySeconds.toFixed(1)}s` 
                : `${Math.floor(delayConfig.delaySeconds / 60)}m`
              }
            </span>
          </div>
        )}
      </div>

      {!participant.videoEnabled && delayedStream && !showBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-700">
          <div className="text-center">
            <div className="h-16 w-16 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-white">{initials}</span>
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4 flex gap-2">
        {!participant.audioEnabled && (
          <div className="bg-red-600/80 p-1.5 rounded-full">
            <MicOff className="h-3 w-3 text-white" />
          </div>
        )}
        {!participant.videoEnabled && (
          <div className="bg-red-600/80 p-1.5 rounded-full">
            <VideoOff className="h-3 w-3 text-white" />
          </div>
        )}
      </div>
    </div>
  );
});

ParticipantVideo.displayName = 'ParticipantVideo';
