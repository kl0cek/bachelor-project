import { Loader2 } from 'lucide-react';

export function LoadingState() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-space-400 mx-auto mb-4" />
        <p className="text-slate-300">Connecting to video call...</p>
      </div>
    </div>
  );
}

LoadingState.displayName = 'LoadingState';
