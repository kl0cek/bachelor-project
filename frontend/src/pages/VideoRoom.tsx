import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useVideoCall } from '../hooks/useVideoCall';
import {
  LoadingState,
  ErrorState,
  ConnectingOverlay,
  VideoGrid,
  ControlsBar,
} from '../components/videocall/index';

const ROOM_PREFIX = 'mission-';

export function VideoRoom() {
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

  const handleToggleSelfView = useCallback(() => {
    setShowSelfView((prev) => !prev);
  }, []);

  if (state.isConnecting && !state.localStream) {
    return <LoadingState />;
  }

  if (state.error && !state.isConnected && !state.isConnecting) {
    return <ErrorState error={state.error} onReturn={handleLeave} />;
  }

  const participants = Array.from(state.participants.values());

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {state.isConnecting && state.localStream && <ConnectingOverlay />}

      <VideoGrid
        localStream={state.localStream}
        isVideoEnabled={state.isVideoEnabled}
        showSelfView={showSelfView}
        onToggleSelfView={handleToggleSelfView}
        participants={participants}
      />

      <ControlsBar
        isAudioEnabled={state.isAudioEnabled}
        isVideoEnabled={state.isVideoEnabled}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onLeave={handleLeave}
      />
    </div>
  );
}

export default VideoRoom;
