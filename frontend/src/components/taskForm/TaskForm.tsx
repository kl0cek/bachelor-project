import { useState } from 'react';
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
import { useToast } from '../../hooks/index';

type UpdateScope = 'single' | 'all';
type DeleteScope = 'single' | 'all';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Activity, updateScope?: UpdateScope) => Promise<Activity | void>;
  onDelete?: (taskId: string, deleteScope?: DeleteScope) => void;
  task?: Activity | null;
  crewMemberId: string;
  defaultStartTime?: number;
  date: string;
  missionEndDate?: string;
  onPdfUploaded?: (activity: Activity) => void;
  isRecurringInstance?: boolean;
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
  isRecurringInstance = false,
}: TaskFormProps) => {
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [updateScope, setUpdateScope] = useState<UpdateScope>('single');

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
  const { showSuccess, showError } = useToast();

  const { isRecurring, recurrence, setIsRecurring, setRecurrence, validateRecurrence } =
    useRecurrence(task);

  const { pdfFile, uploadingPdf, handlePdfSelect, handleRemovePdf, uploadPdfIfNeeded } =
    usePdfUpload({ task, onPdfUploaded, onSubmit: (t) => onSubmit(t, 'single') });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) return;

    if (!isEditing && isRecurring) {
      const recurrenceValidation = validateRecurrence();
      if (!recurrenceValidation.isValid) {
        alert(recurrenceValidation.error);
        return;
      }
    }

    let savedActivity: Activity | void;

    try {
      const taskData = {
        ...buildTaskData(),
        isRecurring: !isEditing && isRecurring,
        recurrence: !isEditing && isRecurring ? recurrence : undefined,
      };

      const scope = isRecurringInstance ? updateScope : undefined;
      savedActivity = await onSubmit(taskData, scope);

      if (isEditing) {
        if (isRecurringInstance && updateScope === 'all') {
          showSuccess('All tasks in series updated successfully');
        } else {
          showSuccess('Task updated successfully');
        }
      } else {
        if (isRecurring) {
          showSuccess('Recurring tasks created successfully');
        } else {
          showSuccess('Task created successfully');
        }
      }
    } catch (error) {
      console.error('Failed to save task:', error);
      showError('Failed to save task. Please check for hour collision.');
      return;
    }

    const activityWithId = savedActivity || buildTaskData();
    await uploadPdfIfNeeded(activityWithId);

    setUpdateScope('single');
    onClose();
  };

  const handleDeleteClick = () => {
    if (isRecurringInstance) {
      setShowDeleteOptions(true);
    } else {
      handleDeleteSingle();
    }
  };

  const handleDeleteSingle = () => {
    if (task && onDelete) {
      onDelete(task.id, 'single');
      showSuccess('Task deleted successfully');
      setShowDeleteOptions(false);
      onClose();
    }
  };

  const handleDeleteSeries = () => {
    if (task && onDelete) {
      onDelete(task.id, 'all');
      showSuccess('Task series deleted successfully');
      setShowDeleteOptions(false);
      onClose();
    }
  };

  const getSubmitButtonText = () => {
    if (uploadingPdf) return 'Uploading PDF...';

    if (isEditing && isRecurringInstance) {
      return updateScope === 'all' ? 'Update All in Series' : 'Update This Instance';
    }

    if (isRecurring && !isEditing) {
      return 'Create Recurring Tasks';
    }

    return isEditing ? 'Update Task' : 'Create Task';
  };

  const showRecurrenceSettings = !isEditing;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3">
            <DialogTitle>
              {isEditing
                ? isRecurringInstance
                  ? 'Edit Recurring Task'
                  : 'Edit Task'
                : 'Create New Task'}
            </DialogTitle>
            {isEditing && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDeleteClick}
                className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950 shrink-0 h-8 w-8 sm:h-9 sm:w-9"
              >
                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        {showDeleteOptions && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              This task is part of a recurring series. What would you like to delete?
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleDeleteSingle}
                className="flex-1 border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30"
              >
                Delete This Instance Only
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleDeleteSeries}
                className="flex-1 border-red-500 text-red-700 hover:bg-red-100 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/30"
              >
                Delete Entire Series
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowDeleteOptions(false)}
              className="w-full text-slate-600 dark:text-slate-400"
            >
              Cancel
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {isEditing && isRecurringInstance && !showDeleteOptions && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 space-y-3">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                This task is part of a recurring series
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="updateScope"
                    value="single"
                    checked={updateScope === 'single'}
                    onChange={() => setUpdateScope('single')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    Update this instance only
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="updateScope"
                    value="all"
                    checked={updateScope === 'all'}
                    onChange={() => setUpdateScope('all')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    Update all in series
                  </span>
                </label>
              </div>
            </div>
          )}

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
              <span className="dark:text-white text-sky-950">{getSubmitButtonText()}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
