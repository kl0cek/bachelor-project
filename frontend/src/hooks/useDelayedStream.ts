import { useRef, useCallback, useEffect, useState } from 'react';

interface UseDelayedStreamOptions {
  delayMs: number;
  enabled: boolean;
}

interface UseDelayedStreamReturn {
  delayedStream: MediaStream | null;
  isBuffering: boolean;
  bufferProgress: number;
  startDelay: (sourceStream: MediaStream) => void;
  stopDelay: () => void;
}

interface VideoFrame {
  imageData: ImageData;
  timestamp: number;
}

export function useDelayedStream(options: UseDelayedStreamOptions): UseDelayedStreamReturn {
  const { delayMs, enabled } = options;

  const [delayedStream, setDelayedStream] = useState<MediaStream | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferProgress, setBufferProgress] = useState(0);

  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const frameBufferRef = useRef<VideoFrame[]>([]);
  const sourceStreamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);
  const isRunningRef = useRef(false);

  const cleanup = useCallback(() => {
    isRunningRef.current = false;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (videoElementRef.current) {
      videoElementRef.current.pause();
      videoElementRef.current.srcObject = null;
      videoElementRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    canvasRef.current = null;
    ctxRef.current = null;
    frameBufferRef.current = [];
    sourceStreamRef.current = null;

    setDelayedStream(null);
    setIsBuffering(false);
    setBufferProgress(0);
  }, []);

  const startDelay = useCallback(
    (sourceStream: MediaStream) => {
      cleanup();

      if (!enabled || delayMs <= 0) {
        setDelayedStream(sourceStream);
        setIsBuffering(false);
        return;
      }

      sourceStreamRef.current = sourceStream;
      isRunningRef.current = true;
      startTimeRef.current = Date.now();
      setIsBuffering(true);
      setBufferProgress(0);

      const combinedStream = new MediaStream();

      const audioTracks = sourceStream.getAudioTracks();
      if (audioTracks.length > 0) {
        try {
          const audioContext = new AudioContext();
          audioContextRef.current = audioContext;

          const source = audioContext.createMediaStreamSource(sourceStream);
          const maxDelay = Math.max(delayMs / 1000 + 1, 10);
          const delayNode = audioContext.createDelay(maxDelay);
          delayNode.delayTime.value = delayMs / 1000;
          const destination = audioContext.createMediaStreamDestination();

          source.connect(delayNode);
          delayNode.connect(destination);

          destination.stream.getAudioTracks().forEach((track) => {
            combinedStream.addTrack(track);
          });
        } catch (error) {
          console.error('Audio delay setup failed:', error);
          audioTracks.forEach((track) => combinedStream.addTrack(track.clone()));
        }
      }

      const videoTracks = sourceStream.getVideoTracks();
      if (videoTracks.length > 0) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 640;
          canvas.height = 480;
          canvasRef.current = canvas;

          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) {
            throw new Error('Cannot get canvas context');
          }
          ctxRef.current = ctx;

          ctx.fillStyle = '#1e293b';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          const video = document.createElement('video');
          video.srcObject = sourceStream;
          video.muted = true;
          video.playsInline = true;
          video.autoplay = true;
          videoElementRef.current = video;

          frameBufferRef.current = [];

          const processFrame = () => {
            if (!isRunningRef.current) return;

            const vid = videoElementRef.current;
            const cvs = canvasRef.current;
            const context = ctxRef.current;

            if (!vid || !cvs || !context) {
              animationFrameRef.current = requestAnimationFrame(processFrame);
              return;
            }

            if (vid.readyState >= 2 && vid.videoWidth > 0) {
              if (cvs.width !== vid.videoWidth || cvs.height !== vid.videoHeight) {
                cvs.width = vid.videoWidth;
                cvs.height = vid.videoHeight;
              }

              context.drawImage(vid, 0, 0, cvs.width, cvs.height);

              const imageData = context.getImageData(0, 0, cvs.width, cvs.height);
              frameBufferRef.current.push({
                imageData,
                timestamp: Date.now(),
              });

              const maxFrames = Math.ceil((delayMs / 1000) * 30) + 60;
              while (frameBufferRef.current.length > maxFrames) {
                frameBufferRef.current.shift();
              }
            }

            const elapsed = Date.now() - startTimeRef.current;
            const progress = Math.min(100, (elapsed / delayMs) * 100);
            setBufferProgress(progress);

            if (elapsed >= delayMs) {
              setIsBuffering(false);
            }

            const targetTime = Date.now() - delayMs;
            let frameToShow: VideoFrame | null = null;

            for (let i = frameBufferRef.current.length - 1; i >= 0; i--) {
              if (frameBufferRef.current[i].timestamp <= targetTime) {
                frameToShow = frameBufferRef.current[i];
                break;
              }
            }

            if (frameToShow && context) {
              context.putImageData(frameToShow.imageData, 0, 0);
            }

            animationFrameRef.current = requestAnimationFrame(processFrame);
          };

          video.onloadedmetadata = () => {
            video.play().catch(console.error);
          };

          video.onplay = () => {
            console.log('Video started playing, beginning frame capture');
            animationFrameRef.current = requestAnimationFrame(processFrame);
          };

          const canvasStream = canvas.captureStream(30);
          canvasStream.getVideoTracks().forEach((track) => {
            combinedStream.addTrack(track);
          });
        } catch (error) {
          console.error('Video delay setup failed:', error);
          videoTracks.forEach((track) => combinedStream.addTrack(track.clone()));
          setIsBuffering(false);
        }
      }

      setDelayedStream(combinedStream);
    },
    [enabled, delayMs, cleanup]
  );

  const stopDelay = useCallback(() => {
    cleanup();
  }, [cleanup]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  useEffect(() => {
    if (sourceStreamRef.current) {
      startDelay(sourceStreamRef.current);
    }
  }, [delayMs, enabled]);

  return {
    delayedStream,
    isBuffering,
    bufferProgress,
    startDelay,
    stopDelay,
  };
}
