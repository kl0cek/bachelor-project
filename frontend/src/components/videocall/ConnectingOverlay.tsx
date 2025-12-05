import { Loader2 } from 'lucide-react';

export function ConnectingOverlay() {
  return (
    <div className="absolute inset-0 bg-slate-900/80 z-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-space-400 mx-auto mb-4" />
        <p className="text-slate-300">Connecting to video call...</p>
      </div>
    </div>
  );
}

ConnectingOverlay.displayName = 'ConnectingOverlay';
