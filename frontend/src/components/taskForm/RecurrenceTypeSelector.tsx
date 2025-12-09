import type { RecurrenceType } from '../../types/types';
import { FORM_STYLES } from '../../constants/formsStyles';

interface RecurrenceTypeSelectorProps {
  value: RecurrenceType;
  onChange: (type: RecurrenceType) => void;
}

export const RecurrenceTypeSelector = ({ value, onChange }: RecurrenceTypeSelectorProps) => {
  return (
    <div className="space-y-2">
      <label className={FORM_STYLES.label}>Repeat Pattern</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as RecurrenceType)}
        className={FORM_STYLES.select}
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly (select days)</option>
        <option value="custom">Custom interval</option>
      </select>
    </div>
  );
};
