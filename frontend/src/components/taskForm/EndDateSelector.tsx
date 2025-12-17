import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { FORM_STYLES } from '../../constants/formsStyles';

interface EndDateSelectorProps {
  endDate?: string;
  missionEndDate?: string;
  onEndDateChange: (endDate?: string) => void;
}

export const EndDateSelector = ({
  endDate,
  missionEndDate,
  onEndDateChange,
}: EndDateSelectorProps) => {
  const [useCustomEndDate, setUseCustomEndDate] = useState(!!endDate);

  const handleEndDateTypeChange = (useCustom: boolean) => {
    setUseCustomEndDate(useCustom);
    if (!useCustom) {
      onEndDateChange(undefined);
    }
  };

  return (
    <div className="space-y-2">
      <label className={`${FORM_STYLES.label} flex items-center gap-2`}>
        <Calendar className="h-4 w-4" />
        Ends
      </label>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="radio"
            id="endOnMission"
            checked={!useCustomEndDate}
            onChange={() => handleEndDateTypeChange(false)}
            className={FORM_STYLES.radio}
          />
          <label
            htmlFor="endOnMission"
            className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            On mission end date
            {missionEndDate && (
              <span className="ml-1 text-xs text-slate-500">
                ({new Date(missionEndDate).toLocaleDateString()})
              </span>
            )}
          </label>
        </div>

        <div className="flex items-start gap-2">
          <input
            type="radio"
            id="endOnDate"
            checked={useCustomEndDate}
            onChange={() => handleEndDateTypeChange(true)}
            className={`${FORM_STYLES.radio} mt-1`}
          />
          <div className="flex-1">
            <label
              htmlFor="endOnDate"
              className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer block mb-1"
            >
              On specific date
            </label>
            {useCustomEndDate && (
              <input
                type="date"
                value={endDate || ''}
                onChange={(e) => onEndDateChange(e.target.value)}
                className={FORM_STYLES.input}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
