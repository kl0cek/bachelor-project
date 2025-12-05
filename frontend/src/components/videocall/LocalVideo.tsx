import { useRef, useEffect } from 'react';
import { Eye, EyeOff, VideoOff } from 'lucide-react';

interface LocalVideoProps {
  stream: MediaStream | null;
  isVideoEnabled: boolean;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export function LocalVideo({
  stream,
  isVideoEnabled,
  isVisible,
  onToggleVisibility,
}: LocalVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !stream) {
      if (videoElement) videoElement.srcObject = null;
      return;
    }

    console.log('Setting local video stream');

    let isMounted = true;
    videoElement.srcObject = stream;

    const timeoutId = setTimeout(() => {
      if (!isMounted || !videoElement) return;

      videoElement
        .play()
        .then(() => {
          if (isMounted) {
            console.log('Video playing successfully');
          }
        })
        .catch((err) => {
          if (!isMounted) return;

          if (err.name === 'NotAllowedError') {
            console.warn('Video autoplay blocked by browser policy');
            return;
          }
          console.error('Video play error:', err);
        });
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);

      if (videoElement) {
        videoElement.pause();
        videoElement.srcObject = null;
      }
    };
  }, [stream]);

  if (!isVisible) {
    return (
      <button
        onClick={onToggleVisibility}
        className="bg-slate-800 rounded-lg p-4 flex items-center justify-center hover:bg-slate-700 transition-colors"
        title="Pokaż podgląd kamery"
      >
        <Eye className="h-6 w-6 text-slate-400" />
      </button>
    );
  }

  return (
    <div className="relative bg-slate-800 rounded-lg overflow-hidden aspect-video">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover transform scale-x-[-1]"
      />

      <button
        onClick={onToggleVisibility}
        className="absolute top-4 left-4 bg-slate-900/80 p-2 rounded-lg hover:bg-slate-700/80"
        title="Ukryj podgląd"
      >
        <EyeOff className="h-4 w-4 text-white" />
      </button>

      <div className="absolute bottom-4 left-4 bg-slate-900/80 px-3 py-1 rounded-lg">
        <p className="text-white text-sm font-medium">You</p>
      </div>

      {!isVideoEnabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-700">
          <VideoOff className="h-12 w-12 text-slate-400" />
        </div>
      )}
    </div>
  );
}

LocalVideo.displayName = 'LocalVideo';
