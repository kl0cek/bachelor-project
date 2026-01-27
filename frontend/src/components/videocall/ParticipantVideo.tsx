import { useRef, useEffect, useState, memo } from 'react';
import { MicOff, VideoOff, Loader2, Clock } from 'lucide-react';
import type { Participant, DelayConfig } from '../../types/videoCall';
import { BufferingIndicator } from './DelayControls';
import { useDelayedStream } from '../../hooks/useDelayedStream';

interface ParticipantVideoProps {
  participant: Participant;
  delayConfig: DelayConfig;
}

function ParticipantVideoInner({ participant, delayConfig }: ParticipantVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const mountedRef = useRef(true);
  const initializedRef = useRef(false);

  const delayMs = delayConfig.enabled ? delayConfig.delaySeconds * 1000 : 0;
  const delayEnabled = delayConfig.enabled && delayConfig.delaySeconds > 0;

  const { delayedStream, isBuffering, bufferProgress, setSourceStream } = useDelayedStream({
    delayMs,
    enabled: delayEnabled,
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!participant.stream) {
      if (initializedRef.current) {
        console.log('[ParticipantVideo] Stream removed for:', participant.userId);
        setSourceStream(null);
        initializedRef.current = false;
      }
      return;
    }

    if (!initializedRef.current) {
      console.log(
        '[ParticipantVideo] Initializing stream for:',
        participant.userId,
        'streamId:',
        participant.stream.id
      );
      initializedRef.current = true;
      setSourceStream(participant.stream);
    }
  }, [participant.stream, participant.userId, setSourceStream]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !delayedStream) {
      if (videoElement) {
        videoElement.srcObject = null;
      }
      setIsPlaying(false);
      return;
    }

    if (videoElement.srcObject === delayedStream) {
      return;
    }

    console.log('[ParticipantVideo] Setting srcObject:', delayedStream.id);
    setVideoError(false);
    videoElement.srcObject = delayedStream;

    const playVideo = async () => {
      if (!mountedRef.current) return;
      try {
        await videoElement.play();
        if (mountedRef.current) {
          setIsPlaying(true);
        }
      } catch (err) {
        if (!mountedRef.current) return;
        const error = err as Error;
        if (error.name !== 'AbortError') {
          console.warn('[ParticipantVideo] Play failed:', error);
          setVideoError(true);
        }
      }
    };

    if (videoElement.readyState >= 2) {
      playVideo();
    } else {
      videoElement.onloadeddata = playVideo;
    }

    return () => {
      if (videoElement) {
        videoElement.onloadeddata = null;
      }
    };
  }, [delayedStream]);

  const displayName = participant.fullName || participant.username || 'Unknown';
  const initials = displayName.charAt(0).toUpperCase();
  const showDelayIndicator = delayEnabled && !isBuffering && isPlaying;
  const showBuffering = isBuffering && delayEnabled;

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
                : `${Math.floor(delayConfig.delaySeconds / 60)}m`}
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
}

export const ParticipantVideo = memo(ParticipantVideoInner, (prev, next) => {
  return (
    prev.participant.userId === next.participant.userId &&
    prev.participant.stream === next.participant.stream &&
    prev.participant.audioEnabled === next.participant.audioEnabled &&
    prev.participant.videoEnabled === next.participant.videoEnabled &&
    prev.delayConfig.enabled === next.delayConfig.enabled &&
    prev.delayConfig.delaySeconds === next.delayConfig.delaySeconds
  );
});

ParticipantVideo.displayName = 'ParticipantVideo';
