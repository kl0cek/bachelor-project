import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Loader2,
  AlertCircle,
  Phone,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useVideoCall } from '../context/VideoCallContext';
import { Button } from './ui';
import type { Participant } from '../types/videoCall';

// ============ Constants ============
const ROOM_PREFIX = 'mission-';

// ============ Participant Video Component ============
interface ParticipantVideoProps {
  participant: Participant;
}

const ParticipantVideo = memo(({ participant }: ParticipantVideoProps) => {
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
          className="w-full h-full object-covertransform scale-x-[-1]"
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

// ============ Local Video Component ============
interface LocalVideoProps {
  stream: MediaStream | null;
  isVideoEnabled: boolean;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

const LocalVideo = ({ stream, isVideoEnabled, isVisible, onToggleVisibility }: LocalVideoProps) => {
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
};

LocalVideo.displayName = 'LocalVideo';

// ============ Control Button Component ============
interface ControlButtonProps {
  onClick: () => void;
  isEnabled: boolean;
  enabledIcon: React.ReactNode;
  disabledIcon: React.ReactNode;
  danger?: boolean;
}

const ControlButton = memo(
  ({ onClick, isEnabled, enabledIcon, disabledIcon, danger = false }: ControlButtonProps) => (
    <Button
      onClick={onClick}
      variant={isEnabled && !danger ? 'default' : 'outline'}
      size="lg"
      className={`rounded-full ${!isEnabled || danger ? 'bg-red-600 hover:bg-red-700 text-white border-none' : ''}`}
    >
      {isEnabled ? enabledIcon : disabledIcon}
    </Button>
  )
);

ControlButton.displayName = 'ControlButton';

// ============ Loading State ============
const LoadingState = () => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="h-12 w-12 animate-spin text-space-400 mx-auto mb-4" />
      <p className="text-slate-300">Connecting to video call...</p>
    </div>
  </div>
);

// ============ Error State ============
interface ErrorStateProps {
  error: string;
  onReturn: () => void;
}

const ErrorState = ({ error, onReturn }: ErrorStateProps) => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center">
    <div className="text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-white mb-2">Connection Error</h2>
      <p className="text-slate-300 mb-6">{error}</p>
      <Button onClick={onReturn}>Return to Mission</Button>
    </div>
  </div>
);

// ============ Main Component ============
export const VideoRoom = () => {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();
  const { state, joinRoom, leaveRoom, toggleAudio, toggleVideo } = useVideoCall();
  const [showSelfView, setShowSelfView] = useState(true);

  const hasJoinedRef = useRef(false);

  useEffect(() => {
    if (!missionId) return;

    if (hasJoinedRef.current) {
      console.log('Already joined, skipping');
      return;
    }

    hasJoinedRef.current = true;
    const roomId = `${ROOM_PREFIX}${missionId}`;
    joinRoom(roomId, missionId);
  }, [missionId, joinRoom]);

  const handleLeave = useCallback(() => {
    hasJoinedRef.current = false;
    leaveRoom();
    navigate(`/mission/${missionId}/scheduler`);
  }, [leaveRoom, navigate, missionId]);

  if (state.isConnecting && !state.localStream) {
    return <LoadingState />;
  }

  if (state.error && !state.isConnected && !state.isConnecting) {
    return <ErrorState error={state.error} onReturn={handleLeave} />;
  }

  const participants = Array.from(state.participants.values());

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {state.isConnecting && state.localStream && (
        <div className="absolute inset-0 bg-slate-900/80 z-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-space-400 mx-auto mb-4" />
            <p className="text-slate-300">Connecting to video call...</p>
          </div>
        </div>
      )}

      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
          <LocalVideo
            key={state.localStream?.id}
            stream={state.localStream}
            isVideoEnabled={state.isVideoEnabled}
            isVisible={showSelfView}
            onToggleVisibility={() => setShowSelfView(!showSelfView)}
          />

          {participants.map((participant) => (
            <ParticipantVideo key={participant.userId} participant={participant} />
          ))}
        </div>
      </div>

      <div className="bg-slate-800 border-t border-slate-700 px-6 py-4">
        <div className="flex items-center justify-center gap-4">
          <ControlButton
            onClick={toggleAudio}
            isEnabled={state.isAudioEnabled}
            enabledIcon={<Mic className="h-5 w-5" />}
            disabledIcon={<MicOff className="h-5 w-5" />}
          />

          <ControlButton
            onClick={toggleVideo}
            isEnabled={state.isVideoEnabled}
            enabledIcon={<Video className="h-5 w-5" />}
            disabledIcon={<VideoOff className="h-5 w-5" />}
          />

          <ControlButton
            onClick={handleLeave}
            isEnabled={true}
            enabledIcon={<Phone className="h-5 w-5 rotate-135" />}
            disabledIcon={<Phone className="h-5 w-5 rotate-135" />}
            danger
          />
        </div>
      </div>
    </div>
  );
};

export default VideoRoom;
