import { useRef, useCallback, useEffect, useState } from 'react';

interface UseDelayedStreamOptions {
  delayMs: number;
  enabled: boolean;
}

interface UseDelayedStreamReturn {
  delayedStream: MediaStream | null;
  isBuffering: boolean;
  bufferProgress: number;
  setSourceStream: (stream: MediaStream | null) => void;
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

  const sourceStreamRef = useRef<MediaStream | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const frameBufferRef = useRef<VideoFrame[]>([]);
  const isRunningRef = useRef(false);
  const delayedStreamRef = useRef<MediaStream | null>(null);

  const delayMsRef = useRef(delayMs);
  const enabledRef = useRef(enabled);
  const bufferStartTimeRef = useRef<number>(0);
  const lastProgressRef = useRef<number>(0);

  useEffect(() => {
    delayMsRef.current = delayMs;
    enabledRef.current = enabled;

    if (delayNodeRef.current && audioContextRef.current) {
      const maxDelay = 179;
      const newDelay = enabled && delayMs > 0 ? Math.min(delayMs / 1000, maxDelay) : 0;
      delayNodeRef.current.delayTime.setValueAtTime(newDelay, audioContextRef.current.currentTime);
    }

    if (enabled && delayMs > 0 && sourceStreamRef.current) {
      bufferStartTimeRef.current = Date.now();
      setIsBuffering(true);
    } else {
      setIsBuffering(false);
    }
  }, [delayMs, enabled]);

  const cleanup = useCallback(() => {
    isRunningRef.current = false;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (videoElementRef.current) {
      videoElementRef.current.onplay = null;
      videoElementRef.current.onloadedmetadata = null;
      videoElementRef.current.pause();
      videoElementRef.current.srcObject = null;
      videoElementRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
    audioContextRef.current = null;
    delayNodeRef.current = null;

    canvasRef.current = null;
    ctxRef.current = null;
    frameBufferRef.current = [];
    delayedStreamRef.current = null;

    setIsBuffering(false);
    setBufferProgress(0);
  }, []);

  const createDelayedStream = useCallback((sourceStream: MediaStream) => {
    const combinedStream = new MediaStream();
    const currentDelayMs = delayMsRef.current;
    const currentEnabled = enabledRef.current;

    const audioTracks = sourceStream.getAudioTracks();
    if (audioTracks.length > 0) {
      try {
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(sourceStream);

        const maxDelaySeconds = 180;
        const delayNode = audioContext.createDelay(maxDelaySeconds);
        delayNodeRef.current = delayNode;

        const initialDelay =
          currentEnabled && currentDelayMs > 0
            ? Math.min(currentDelayMs / 1000, maxDelaySeconds - 1)
            : 0;
        delayNode.delayTime.value = initialDelay;

        const destination = audioContext.createMediaStreamDestination();
        source.connect(delayNode);
        delayNode.connect(destination);

        destination.stream.getAudioTracks().forEach((track) => {
          combinedStream.addTrack(track);
        });
      } catch (error) {
        console.error('[useDelayedStream] Audio delay failed:', error);
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
        if (!ctx) throw new Error('Cannot get canvas context');
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
          const currentDelay = delayMsRef.current;
          const isEnabled = enabledRef.current;

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

            const now = Date.now();
            const imageData = context.getImageData(0, 0, cvs.width, cvs.height);
            frameBufferRef.current.push({ imageData, timestamp: now });

            const effectiveDelay = Math.max(currentDelay, 5000);
            const maxFrames = Math.ceil((effectiveDelay / 1000) * 35) + 150;
            while (frameBufferRef.current.length > maxFrames) {
              frameBufferRef.current.shift();
            }

            if (isEnabled && currentDelay > 0) {
              const targetTime = now - currentDelay;
              let frameToShow: VideoFrame | null = null;

              for (let i = frameBufferRef.current.length - 1; i >= 0; i--) {
                if (frameBufferRef.current[i].timestamp <= targetTime) {
                  frameToShow = frameBufferRef.current[i];
                  break;
                }
              }

              if (frameToShow) {
                context.putImageData(frameToShow.imageData, 0, 0);
              }

              if (now - lastProgressRef.current > 200) {
                lastProgressRef.current = now;
                const elapsed = now - bufferStartTimeRef.current;
                const progress = Math.min(100, (elapsed / currentDelay) * 100);
                setBufferProgress(progress);
                if (elapsed >= currentDelay) {
                  setIsBuffering(false);
                }
              }
            }
          }

          animationFrameRef.current = requestAnimationFrame(processFrame);
        };

        video.onloadedmetadata = () => {
          video.play().catch((e) => console.error('[useDelayedStream] Play failed:', e));
        };

        video.onplay = () => {
          isRunningRef.current = true;
          bufferStartTimeRef.current = Date.now();
          if (currentEnabled && currentDelayMs > 0) {
            setIsBuffering(true);
          }
          animationFrameRef.current = requestAnimationFrame(processFrame);
        };

        const canvasStream = canvas.captureStream(30);
        canvasStream.getVideoTracks().forEach((track) => {
          combinedStream.addTrack(track);
        });
      } catch (error) {
        console.error('[useDelayedStream] Video delay failed:', error);
        videoTracks.forEach((track) => combinedStream.addTrack(track.clone()));
      }
    }

    delayedStreamRef.current = combinedStream;

    return combinedStream;
  }, []);

  const setSourceStream = useCallback(
    (stream: MediaStream | null) => {
      if (!stream) {
        cleanup();
        sourceStreamRef.current = null;
        setDelayedStream(null);
        return;
      }

      cleanup();
      sourceStreamRef.current = stream;

      const pipelineStream = createDelayedStream(stream);

      if (enabledRef.current && delayMsRef.current > 0) {
        bufferStartTimeRef.current = Date.now();
        setIsBuffering(true);
      }

      setDelayedStream(pipelineStream);
    },
    [cleanup, createDelayedStream]
  );

  useEffect(() => {
    return () => {
      cleanup();
      sourceStreamRef.current = null;
    };
  }, [cleanup]);

  return {
    delayedStream,
    isBuffering,
    bufferProgress,
    setSourceStream,
  };
}
