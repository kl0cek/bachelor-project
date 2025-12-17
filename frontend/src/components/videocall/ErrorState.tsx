import { AlertCircle } from 'lucide-react';
import { Button } from '../ui';

interface ErrorStateProps {
  error: string;
  onReturn: () => void;
}

export function ErrorState({ error, onReturn }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Connection Error</h2>
        <p className="text-slate-300 mb-6">{error}</p>
        <Button onClick={onReturn}>Return to Mission</Button>
      </div>
    </div>
  );
}

ErrorState.displayName = 'ErrorState';
