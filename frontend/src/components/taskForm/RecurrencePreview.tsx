import { getRecurrencePreview } from '../../utils/taskUtills';
import { FORM_STYLES } from '../../constants/formsStyles';
import type { RecurrenceConfig } from '../../types/types';

interface RecurrencePreviewProps {
  recurrence?: RecurrenceConfig;
  missionEndDate?: string;
}

export const RecurrencePreview = ({ recurrence, missionEndDate }: RecurrencePreviewProps) => {
  return (
    <div className={FORM_STYLES.previewBox}>
      <p className="text-xs font-medium text-space-700 dark:text-space-300">
        Preview: {getRecurrencePreview(recurrence, missionEndDate)}
      </p>
    </div>
  );
};
