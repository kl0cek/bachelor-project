import { Mic, MicOff, Video, VideoOff, Phone } from 'lucide-react';
import { ControlButton } from './ControlButton';

interface ControlsBarProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onLeave: () => void;
}

export function ControlsBar({
  isAudioEnabled,
  isVideoEnabled,
  onToggleAudio,
  onToggleVideo,
  onLeave,
}: ControlsBarProps) {
  return (
    <div className="bg-slate-800 border-t border-slate-700 px-6 py-4">
      <div className="flex items-center justify-center gap-4">
        <ControlButton
          onClick={onToggleAudio}
          isEnabled={isAudioEnabled}
          enabledIcon={<Mic className="h-5 w-5" />}
          disabledIcon={<MicOff className="h-5 w-5" />}
        />

        <ControlButton
          onClick={onToggleVideo}
          isEnabled={isVideoEnabled}
          enabledIcon={<Video className="h-5 w-5" />}
          disabledIcon={<VideoOff className="h-5 w-5" />}
        />

        <ControlButton
          onClick={onLeave}
          isEnabled={true}
          enabledIcon={<Phone className="h-5 w-5 rotate-135" />}
          disabledIcon={<Phone className="h-5 w-5 rotate-135" />}
          danger
        />
      </div>
    </div>
  );
}

ControlsBar.displayName = 'ControlsBar';
