import { useRef, useCallback, useEffect } from 'react';
import type { Participant, DelayConfig } from '../types/videoCall';

interface DelayedStreamManager {
  audioContext: AudioContext | null;
  delayNode: DelayNode | null;
  sourceNode: MediaStreamAudioSourceNode | null;
  destinationNode: MediaStreamAudioDestinationNode | null;
  canvas: HTMLCanvasElement | null;
  videoElement: HTMLVideoElement | null;
  animationFrame: number | null;
  delayedStream: MediaStream | null;
}

interface UseParticipantDelaysReturn {
  getDelayedStream: (participant: Participant) => MediaStream | null;
  updateParticipantStream: (userId: string, stream: MediaStream) => void;
  removeParticipant: (userId: string) => void;
  cleanupAll: () => void;
}

export function useParticipantDelays(
  delayConfig: DelayConfig,
  onStreamReady?: (userId: string, delayedStream: MediaStream) => void
): UseParticipantDelaysReturn {
  const managersRef = useRef<Map<string, DelayedStreamManager>>(new Map());
  const delayMsRef = useRef(delayConfig.delaySeconds * 1000);
  const enabledRef = useRef(delayConfig.enabled);

  useEffect(() => {
    delayMsRef.current = delayConfig.delaySeconds * 1000;
    enabledRef.current = delayConfig.enabled;
  }, [delayConfig]);

  const cleanupManager = useCallback((manager: DelayedStreamManager) => {
    if (manager.animationFrame) {
      cancelAnimationFrame(manager.animationFrame);
    }

    if (manager.videoElement) {
      manager.videoElement.pause();
      manager.videoElement.srcObject = null;
    }

    if (manager.sourceNode) {
      manager.sourceNode.disconnect();
    }

    if (manager.delayNode) {
      manager.delayNode.disconnect();
    }

    if (manager.destinationNode) {
      manager.destinationNode.disconnect();
    }

    if (manager.audioContext && manager.audioContext.state !== 'closed') {
      manager.audioContext.close().catch(console.error);
    }

    if (manager.delayedStream) {
      manager.delayedStream.getTracks().forEach((track) => track.stop());
    }
  }, []);

  const createDelayedStream = useCallback(
    (userId: string, sourceStream: MediaStream): MediaStream => {
      const existingManager = managersRef.current.get(userId);
      if (existingManager) {
        cleanupManager(existingManager);
      }

      const delayMs = delayMsRef.current;
      const enabled = enabledRef.current;

      if (!enabled || delayMs <= 0) {
        const manager: DelayedStreamManager = {
          audioContext: null,
          delayNode: null,
          sourceNode: null,
          destinationNode: null,
          canvas: null,
          videoElement: null,
          animationFrame: null,
          delayedStream: sourceStream,
        };
        managersRef.current.set(userId, manager);
        return sourceStream;
      }

      const manager: DelayedStreamManager = {
        audioContext: null,
        delayNode: null,
        sourceNode: null,
        destinationNode: null,
        canvas: null,
        videoElement: null,
        animationFrame: null,
        delayedStream: null,
      };

      const combinedStream = new MediaStream();

      const audioTracks = sourceStream.getAudioTracks();
      if (audioTracks.length > 0) {
        try {
          const audioContext = new AudioContext();
          manager.audioContext = audioContext;

          const source = audioContext.createMediaStreamSource(sourceStream);
          manager.sourceNode = source;

          const maxDelay = Math.max(delayMs / 1000 + 1, 5);
          const delayNode = audioContext.createDelay(maxDelay);
          delayNode.delayTime.value = delayMs / 1000;
          manager.delayNode = delayNode;

          const destination = audioContext.createMediaStreamDestination();
          manager.destinationNode = destination;

          source.connect(delayNode);
          delayNode.connect(destination);

          destination.stream.getAudioTracks().forEach((track) => {
            combinedStream.addTrack(track);
          });
        } catch (error) {
          console.error('Failed to create delayed audio:', error);
          audioTracks.forEach((track) => combinedStream.addTrack(track));
        }
      }

      const videoTracks = sourceStream.getVideoTracks();
      if (videoTracks.length > 0) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 640;
          canvas.height = 480;
          manager.canvas = canvas;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            const video = document.createElement('video');
            video.srcObject = sourceStream;
            video.muted = true;
            video.playsInline = true;
            manager.videoElement = video;

            interface VideoFrame {
              imageData: ImageData;
              timestamp: number;
            }
            const frameBuffer: VideoFrame[] = [];
            const maxBufferSize = Math.ceil((delayMs / 1000) * 30) + 60;

            video.play().catch(console.error);

            const captureFrame = () => {
              if (!video || video.readyState < 2) {
                manager.animationFrame = requestAnimationFrame(captureFrame);
                return;
              }

              if (canvas.width !== video.videoWidth && video.videoWidth > 0) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
              }

              ctx.drawImage(video, 0, 0);
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

              frameBuffer.push({
                imageData,
                timestamp: Date.now(),
              });

              while (frameBuffer.length > maxBufferSize) {
                frameBuffer.shift();
              }

              const targetTime = Date.now() - delayMs;
              let frameToShow: VideoFrame | null = null;

              for (let i = frameBuffer.length - 1; i >= 0; i--) {
                if (frameBuffer[i].timestamp <= targetTime) {
                  frameToShow = frameBuffer[i];
                  break;
                }
              }

              if (frameToShow) {
                ctx.putImageData(frameToShow.imageData, 0, 0);
              }

              manager.animationFrame = requestAnimationFrame(captureFrame);
            };

            manager.animationFrame = requestAnimationFrame(captureFrame);

            const canvasStream = canvas.captureStream(30);
            canvasStream.getVideoTracks().forEach((track) => {
              combinedStream.addTrack(track);
            });
          }
        } catch (error) {
          console.error('Failed to create delayed video:', error);
          videoTracks.forEach((track) => combinedStream.addTrack(track));
        }
      }

      manager.delayedStream = combinedStream;
      managersRef.current.set(userId, manager);

      if (onStreamReady) {
        onStreamReady(userId, combinedStream);
      }

      return combinedStream;
    },
    [cleanupManager, onStreamReady]
  );

  const getDelayedStream = useCallback(
    (participant: Participant): MediaStream | null => {
      if (!participant.stream) return null;

      const existingManager = managersRef.current.get(participant.userId);
      if (existingManager?.delayedStream) {
        return existingManager.delayedStream;
      }

      return createDelayedStream(participant.userId, participant.stream);
    },
    [createDelayedStream]
  );

  const updateParticipantStream = useCallback(
    (userId: string, stream: MediaStream) => {
      createDelayedStream(userId, stream);
    },
    [createDelayedStream]
  );

  const removeParticipant = useCallback(
    (userId: string) => {
      const manager = managersRef.current.get(userId);
      if (manager) {
        cleanupManager(manager);
        managersRef.current.delete(userId);
      }
    },
    [cleanupManager]
  );

  const cleanupAll = useCallback(() => {
    managersRef.current.forEach((manager) => {
      cleanupManager(manager);
    });
    managersRef.current.clear();
  }, [cleanupManager]);

  useEffect(() => {
    return () => {
      cleanupAll();
    };
  }, [cleanupAll]);

  return {
    getDelayedStream,
    updateParticipantStream,
    removeParticipant,
    cleanupAll,
  };
}
