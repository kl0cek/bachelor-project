import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Settings } from 'lucide-react';
import { useVideoCall } from '../hooks/useVideoCall';
import {
  LoadingState,
  ErrorState,
  ConnectingOverlay,
  VideoGrid,
  ControlsBar,
} from '../components/videocall/index';
import { DelayControls, DelayIndicator } from '../components/videocall/DelayControls';

const ROOM_PREFIX = 'mission-';

export function VideoRoom() {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();
  const { 
    state, 
    joinRoom, 
    leaveRoom, 
    toggleAudio, 
    toggleVideo,
    setDelay,
    toggleDelay,
    setDelayPreset,
  } = useVideoCall();
  const [showSelfView, setShowSelfView] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

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

  const handleToggleSettings = useCallback(() => {
    setShowSettings((prev) => !prev);
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

      <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between">
        <DelayIndicator delayConfig={state.delayConfig} />
        
        <button
          onClick={handleToggleSettings}
          className={`p-2 rounded-lg transition-colors ${
            showSettings 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      {showSettings && (
        <div className="absolute top-16 right-4 z-40 w-80">
          <DelayControls
            delayConfig={state.delayConfig}
            onSetDelay={setDelay}
            onToggleDelay={toggleDelay}
            onSetPreset={setDelayPreset}
          />
        </div>
      )}

      <VideoGrid
        localStream={state.localStream}
        isVideoEnabled={state.isVideoEnabled}
        showSelfView={showSelfView}
        onToggleSelfView={handleToggleSelfView}
        participants={participants}
        delayConfig={state.delayConfig}
      />

      <div className="fixed bottom-0 left-0 right-0 z-50">
        <ControlsBar
          isAudioEnabled={state.isAudioEnabled}
          isVideoEnabled={state.isVideoEnabled}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onLeave={handleLeave}
        />
      </div>
    </div>
  );
}

export default VideoRoom;
