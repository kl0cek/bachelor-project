import { useState, useCallback } from 'react';
import { Clock, Satellite, Moon, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import type { DelayConfig, DelayPreset } from '../../types/videoCall';

interface DelayControlsProps {
  delayConfig: DelayConfig;
  onSetDelay: (seconds: number) => void;
  onToggleDelay: (enabled: boolean) => void;
  onSetPreset: (preset: DelayPreset) => void;
}

const PRESETS: { key: DelayPreset; label: string; seconds: number; icon: typeof Clock }[] = [
  { key: 'none', label: 'Brak opóźnienia', seconds: 0, icon: Clock },
  { key: 'moon', label: 'Księżyc (~1.3s)', seconds: 1.3, icon: Moon },
  { key: 'mars_min', label: 'Mars min (~3 min)', seconds: 180, icon: Satellite },
  { key: 'mars_max', label: 'Mars max (~22 min)', seconds: 1320, icon: Satellite },
];

function formatDelay(seconds: number): string {
  if (seconds === 0) return '0s';
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs.toFixed(0)}s` : `${mins}m`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function DelayControls({
  delayConfig,
  onSetDelay,
  onToggleDelay,
  onSetPreset,
}: DelayControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(
    Math.floor(delayConfig.delaySeconds / 60).toString()
  );
  const [customSeconds, setCustomSeconds] = useState(
    (delayConfig.delaySeconds % 60).toFixed(0)
  );

  const handlePresetClick = useCallback((preset: DelayPreset) => {
    onSetPreset(preset);
    if (preset !== 'custom') {
      const presetData = PRESETS.find(p => p.key === preset);
      if (presetData) {
        setCustomMinutes(Math.floor(presetData.seconds / 60).toString());
        setCustomSeconds((presetData.seconds % 60).toFixed(0));
      }
    }
  }, [onSetPreset]);

  const handleCustomDelayChange = useCallback(() => {
    const mins = parseInt(customMinutes) || 0;
    const secs = parseInt(customSeconds) || 0;
    const totalSeconds = mins * 60 + secs;
    onSetDelay(totalSeconds);
  }, [customMinutes, customSeconds, onSetDelay]);

  const handleToggle = useCallback(() => {
    onToggleDelay(!delayConfig.enabled);
  }, [delayConfig.enabled, onToggleDelay]);

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Clock className={`h-5 w-5 ${delayConfig.enabled ? 'text-blue-400' : 'text-slate-400'}`} />
          <div className="text-left">
            <p className="text-white font-medium">Opóźnienie komunikacji</p>
            <p className="text-sm text-slate-400">
              {delayConfig.enabled 
                ? `Aktywne: ${formatDelay(delayConfig.delaySeconds)}`
                : 'Wyłączone'
              }
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-slate-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Włącz opóźnienie</span>
            <button
              onClick={handleToggle}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                delayConfig.enabled ? 'bg-blue-600' : 'bg-slate-600'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  delayConfig.enabled ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-slate-400">Presety opóźnienia</p>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((preset) => {
                const Icon = preset.icon;
                const isSelected = delayConfig.delayPreset === preset.key;
                return (
                  <button
                    key={preset.key}
                    onClick={() => handlePresetClick(preset.key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="truncate">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-slate-400" />
              <p className="text-sm text-slate-400">Własne opóźnienie</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-xs text-slate-500 block mb-1">Minuty</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-500 block mb-1">Sekundy</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={customSeconds}
                  onChange={(e) => setCustomSeconds(e.target.value)}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm"
                />
              </div>
              <div className="pt-5">
                <button
                  onClick={handleCustomDelayChange}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
                >
                  Ustaw
                </button>
              </div>
            </div>
          </div>

          {delayConfig.enabled && delayConfig.delaySeconds > 0 && (
            <div className="bg-slate-700/50 rounded-lg p-3">
              <p className="text-sm text-slate-300">
                <span className="text-blue-400 font-medium">Info:</span> Obraz i dźwięk od innych uczestników 
                będą opóźnione o {formatDelay(delayConfig.delaySeconds)}. Symuluje to realne 
                opóźnienie komunikacji kosmicznej.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function DelayIndicator({ delayConfig }: { delayConfig: DelayConfig }) {
  if (!delayConfig.enabled || delayConfig.delaySeconds === 0) return null;

  return (
    <div className="flex items-center gap-2 bg-blue-600/20 text-blue-400 px-3 py-1.5 rounded-lg">
      <Clock className="h-4 w-4" />
      <span className="text-sm font-medium">
        Opóźnienie: {formatDelay(delayConfig.delaySeconds)}
      </span>
    </div>
  );
}

export function BufferingIndicator({ 
  isBuffering, 
  progress, 
  delaySeconds 
}: { 
  isBuffering: boolean; 
  progress: number;
  delaySeconds: number;
}) {
  if (!isBuffering) return null;

  return (
    <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center">
      <div className="text-center space-y-3">
        <Clock className="h-8 w-8 text-blue-400 animate-pulse mx-auto" />
        <div className="text-white">
          <p className="font-medium">Buforowanie...</p>
          <p className="text-sm text-slate-400">
            Opóźnienie: {formatDelay(delaySeconds)}
          </p>
        </div>
        <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-slate-500">{Math.round(progress)}%</p>
      </div>
    </div>
  );
}
