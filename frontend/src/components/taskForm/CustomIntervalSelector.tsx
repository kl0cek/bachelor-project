import { FORM_STYLES } from '../../constants/formsStyles';

interface CustomIntervalSelectorProps {
  interval: number;
  onIntervalChange: (interval: number) => void;
}

export const CustomIntervalSelector = ({
  interval,
  onIntervalChange,
}: CustomIntervalSelectorProps) => {
  return (
    <div className="space-y-2">
      <label className={FORM_STYLES.label}>Repeat every</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="1"
          max="30"
          value={interval}
          onChange={(e) => onIntervalChange(parseInt(e.target.value))}
          className="w-20 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500"
        />
        <span className="text-sm text-slate-600 dark:text-slate-400">days</span>
      </div>
    </div>
  );
};
