import { Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button } from '../ui/index';
import {
  TaskFormBasicFields,
  PrioritySelector,
  EquipmentManager,
  PDFUploadSection,
  RecurrenceSettings,
} from './index';
import { useTaskForm, useRecurrence, usePdfUpload } from '../../hooks/index';
import { FORM_STYLES } from '../../constants/formsStyles';
import type { Activity } from '../../types/types';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Activity) => Promise<Activity | void>;
  onDelete?: (taskId: string) => void;
  task?: Activity | null;
  crewMemberId: string;
  defaultStartTime?: number;
  date: string;
  missionEndDate?: string;
  onPdfUploaded?: (activity: Activity) => void;
}

export const TaskForm = ({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  task,
  crewMemberId,
  defaultStartTime = 6,
  missionEndDate,
  onPdfUploaded,
}: TaskFormProps) => {
  const {
    formData,
    setFormData,
    newEquipment,
    setNewEquipment,
    isEditing,
    handleAddEquipment,
    handleRemoveEquipment,
    buildTaskData,
  } = useTaskForm({ task, defaultStartTime, crewMemberId });

  const { isRecurring, recurrence, setIsRecurring, setRecurrence, validateRecurrence } =
    useRecurrence(task);

  const { pdfFile, uploadingPdf, handlePdfSelect, handleRemovePdf, uploadPdfIfNeeded } =
    usePdfUpload({ task, onPdfUploaded, onSubmit });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) return;

    const recurrenceValidation = validateRecurrence();
    if (!recurrenceValidation.isValid) {
      alert(recurrenceValidation.error);
      return;
    }

    let savedActivity: Activity | void;

    try {
      const taskData = {
        ...buildTaskData(),
        isRecurring,
        recurrence: isRecurring ? recurrence : undefined,
      };
      savedActivity = await onSubmit(taskData);
    } catch (error) {
      console.error('Failed to save task:', error);
      alert('Failed to save task. Please try again.');
      return;
    }

    const activityWithId = savedActivity || buildTaskData();
    await uploadPdfIfNeeded(activityWithId);

    onClose();
  };

  const handleDelete = () => {
    if (task && onDelete) {
      onDelete(task.id);
      onClose();
    }
  };

  const showRecurrenceSettings = !isEditing || !task?.parentActivityId;
  const isRecurringInstance = isEditing && task?.parentActivityId;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3">
            <DialogTitle>{isEditing ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            {isEditing && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950 shrink-0 h-8 w-8 sm:h-9 sm:w-9"
              >
                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <TaskFormBasicFields
            formData={formData}
            setFormData={setFormData}
            defaultStartTime={defaultStartTime}
          />

          <PrioritySelector formData={formData} setFormData={setFormData} />

          <div className="space-y-1.5 sm:space-y-2">
            <label className={FORM_STYLES.label}>Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              className={FORM_STYLES.textarea}
              placeholder="Task description..."
            />
          </div>

          <EquipmentManager
            formData={formData}
            newEquipment={newEquipment}
            setNewEquipment={setNewEquipment}
            onAddEquipment={handleAddEquipment}
            onRemoveEquipment={handleRemoveEquipment}
          />

          {showRecurrenceSettings && (
            <RecurrenceSettings
              isRecurring={isRecurring}
              recurrence={recurrence}
              missionEndDate={missionEndDate}
              onRecurringChange={setIsRecurring}
              onRecurrenceChange={setRecurrence}
            />
          )}

          {isRecurringInstance && (
            <div className={FORM_STYLES.infoBox}>
              <p className="text-xs text-blue-800 dark:text-blue-200">
                This is part of a recurring series. Changes will only affect this instance.
              </p>
            </div>
          )}

          <PDFUploadSection
            formData={formData}
            pdfFile={pdfFile}
            onPdfSelect={handlePdfSelect}
            onRemovePdf={() => handleRemovePdf(setFormData)}
          />

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:w-auto">
              <span className="dark:text-white text-sky-950">Cancel</span>
            </Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={uploadingPdf}>
              <span className="dark:text-white text-sky-950">
                {uploadingPdf
                  ? 'Uploading PDF...'
                  : isRecurring && !isEditing
                    ? 'Create Recurring Tasks'
                    : isEditing
                      ? 'Update Task'
                      : 'Create Task'}
              </span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
