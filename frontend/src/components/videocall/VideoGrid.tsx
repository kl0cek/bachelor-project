import type { Participant } from '../../types/videoCall';
import { LocalVideo } from './LocalVideo';
import { ParticipantVideo } from './ParticipantVideo';

interface VideoGridProps {
  localStream: MediaStream | null;
  isVideoEnabled: boolean;
  showSelfView: boolean;
  onToggleSelfView: () => void;
  participants: Participant[];
}

export function VideoGrid({
  localStream,
  isVideoEnabled,
  showSelfView,
  onToggleSelfView,
  participants,
}: VideoGridProps) {
  return (
    <div className="flex-1 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
        <LocalVideo
          key={localStream?.id}
          stream={localStream}
          isVideoEnabled={isVideoEnabled}
          isVisible={showSelfView}
          onToggleVisibility={onToggleSelfView}
        />

        {participants.map((participant) => (
          <ParticipantVideo key={participant.userId} participant={participant} />
        ))}
      </div>
    </div>
  );
}

VideoGrid.displayName = 'VideoGrid';
