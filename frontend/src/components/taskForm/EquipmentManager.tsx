import { Plus, X } from 'lucide-react';
import { Button, Badge } from '../ui/index';
import type { Activity } from '../../types/types';

interface EquipmentManagerProps {
  formData: Partial<Activity>;
  newEquipment: string;
  setNewEquipment: (value: string) => void;
  onAddEquipment: () => void;
  onRemoveEquipment: (index: number) => void;
}

export const EquipmentManager = ({
  formData,
  newEquipment,
  setNewEquipment,
  onAddEquipment,
  onRemoveEquipment,
}: EquipmentManagerProps) => {
  return (
    <div className="space-y-2 sm:space-y-3">
      <label className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
        Equipment Required
      </label>

      <div className="flex gap-2">
        <input
          type="text"
          value={newEquipment}
          onChange={(e) => setNewEquipment(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), onAddEquipment())}
          className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500 focus:border-transparent"
          placeholder="Add equipment..."
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onAddEquipment}
          className="shrink-0 h-9 w-9 sm:h-10 sm:w-10"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {formData.equipment && formData.equipment.length > 0 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {formData.equipment.map((item, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1"
            >
              <span className="truncate max-w-[120px] sm:max-w-none">{item}</span>
              <button
                type="button"
                onClick={() => onRemoveEquipment(index)}
                className="ml-0.5 sm:ml-1 hover:text-orange-500 shrink-0"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
