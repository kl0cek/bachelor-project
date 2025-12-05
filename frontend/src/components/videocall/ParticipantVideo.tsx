import { useRef, useEffect, memo } from 'react';
import { MicOff, VideoOff, Loader2 } from 'lucide-react';
import type { Participant } from '../../types/videoCall';

interface ParticipantVideoProps {
  participant: Participant;
}

export const ParticipantVideo = memo(({ participant }: ParticipantVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !participant.stream) return;

    videoElement.srcObject = participant.stream;

    return () => {
      if (videoElement) {
        videoElement.srcObject = null;
      }
    };
  }, [participant.stream]);

  const displayName = participant.fullName || participant.username || 'Unknown';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative bg-slate-800 rounded-lg overflow-hidden aspect-video">
      {participant.stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover transform scale-x-[-1]"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-700">
          <div className="text-center">
            <div className="h-16 w-16 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-white">{initials}</span>
            </div>
            <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" />
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 bg-slate-900/80 px-3 py-1 rounded-lg">
        <p className="text-white text-sm font-medium">{displayName}</p>
      </div>

      {!participant.videoEnabled && participant.stream && (
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
