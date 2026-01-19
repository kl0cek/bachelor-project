import { AlertCircle, ArrowLeft } from 'lucide-react';

interface ErrorStateProps {
  error: string;
  onReturn: () => void;
}

export function ErrorState({ error, onReturn }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="bg-red-500/20 rounded-full p-4 w-fit mx-auto mb-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <h2 className="text-white text-xl font-semibold mb-2">Unabled to connent </h2>
        <p className="text-slate-400 mb-6">{error}</p>
        <button
          onClick={onReturn}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to scheduler
        </button>
      </div>
    </div>
  );
}

ErrorState.displayName = 'ErrorState';
