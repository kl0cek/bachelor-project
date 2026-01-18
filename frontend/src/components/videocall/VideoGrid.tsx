import type { Participant, DelayConfig } from '../../types/videoCall';
import { LocalVideo } from './LocalVideo';
import { ParticipantVideo } from './ParticipantVideo';

interface VideoGridProps {
  localStream: MediaStream | null;
  isVideoEnabled: boolean;
  showSelfView: boolean;
  onToggleSelfView: () => void;
  participants: Participant[];
  delayConfig: DelayConfig;
}

export function VideoGrid({
  localStream,
  isVideoEnabled,
  showSelfView,
  onToggleSelfView,
  participants,
  delayConfig,
}: VideoGridProps) {
  const totalParticipants = participants.length + 1;

  const getGridClass = () => {
    if (totalParticipants === 1) return 'grid-cols-1 max-w-2xl mx-auto';
    if (totalParticipants === 2) return 'grid-cols-1 md:grid-cols-2';
    if (totalParticipants <= 4) return 'grid-cols-1 md:grid-cols-2';
    if (totalParticipants <= 6) return 'grid-cols-2 md:grid-cols-3';
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  };

  return (
    <div className="flex-1 p-6">
      <div className={`grid ${getGridClass()} gap-4 h-full`}>
        <LocalVideo
          key={localStream?.id}
          stream={localStream}
          isVideoEnabled={isVideoEnabled}
          isVisible={showSelfView}
          onToggleVisibility={onToggleSelfView}
        />

        {participants.map((participant) => (
          <ParticipantVideo
            key={participant.userId}
            participant={participant}
            delayConfig={delayConfig}
          />
        ))}
      </div>
    </div>
  );
}

VideoGrid.displayName = 'VideoGrid';
