import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Loader2, AlertCircle, Phone, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { useVideoCall } from '../context/VideoCallContext';
import { Button } from './ui';

export const VideoRoom = () => {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();
  const { state, joinRoom, leaveRoom, toggleAudio, toggleVideo } = useVideoCall();
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (missionId) {
      const roomId = `mission-${missionId}`;
      joinRoom(roomId, missionId);
    }

    return () => {
      leaveRoom();
    };
  }, [missionId]);

  useEffect(() => {
    if (localVideoRef.current && state.localStream) {
      console.log('Setting local stream:', state.localStream);
      console.log('Video tracks:', state.localStream.getVideoTracks());
      console.log('Audio tracks:', state.localStream.getAudioTracks());
      localVideoRef.current.srcObject = state.localStream;

      localVideoRef.current.play().catch((err) => {
        console.error('Error playing video:', err);
      });
    }
  }, [state.localStream]);

  const handleLeave = () => {
    leaveRoom();
    navigate(`/mission/${missionId}/scheduler`);
  };

  if (state.isConnecting) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-space-400 mx-auto mb-4" />
          <p className="text-slate-300">Connecting to video call...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-slate-300 mb-6">{state.error}</p>
          <Button onClick={handleLeave}>Return to Mission</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">Mission Video Call</h1>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span>{state.participants.size + 1} participants</span>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
          {/* Local Video */}
          <div className="relative bg-slate-800 rounded-lg overflow-hidden aspect-video">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
            <div className="absolute bottom-4 left-4 bg-slate-900/80 px-3 py-1 rounded-lg">
              <p className="text-white text-sm font-medium">You</p>
            </div>
            {!state.isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-700">
                <VideoOff className="h-12 w-12 text-slate-400" />
              </div>
            )}
          </div>

          {/* Remote Participants */}
          {Array.from(state.participants.values()).map((participant) => (
            <ParticipantVideo key={participant.userId} participant={participant} />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-800 border-t border-slate-700 px-6 py-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={toggleAudio}
            variant={state.isAudioEnabled ? 'default' : 'outline'}
            size="lg"
            className={`rounded-full ${!state.isAudioEnabled ? 'bg-red-600 hover:bg-red-700' : ''}`}
          >
            {state.isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>

          <Button
            onClick={toggleVideo}
            variant={state.isVideoEnabled ? 'default' : 'outline'}
            size="lg"
            className={`rounded-full ${!state.isVideoEnabled ? 'bg-red-600 hover:bg-red-700' : ''}`}
          >
            {state.isVideoEnabled ? (
              <Video className="h-5 w-5" />
            ) : (
              <VideoOff className="h-5 w-5" />
            )}
          </Button>

          <Button
            onClick={handleLeave}
            variant="outline"
            size="lg"
            className="rounded-full bg-red-600 hover:bg-red-700 text-white border-none"
          >
            <Phone className="h-5 w-5 rotate-135" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Participant Video Component
interface ParticipantVideoProps {
  participant: any;
}

const ParticipantVideo = ({ participant }: ParticipantVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  return (
    <div className="relative bg-slate-800 rounded-lg overflow-hidden aspect-video">
      {participant.stream ? (
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-700">
          <div className="text-center">
            <div className="h-16 w-16 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-white">
                {participant.fullName?.[0] || participant.username?.[0] || '?'}
              </span>
            </div>
            <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" />
          </div>
        </div>
      )}
      <div className="absolute bottom-4 left-4 bg-slate-900/80 px-3 py-1 rounded-lg">
        <p className="text-white text-sm font-medium">
          {participant.fullName || participant.username}
        </p>
      </div>
      {!participant.videoEnabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-700">
          <VideoOff className="h-12 w-12 text-slate-400" />
        </div>
      )}
    </div>
  );
};

export default VideoRoom;
