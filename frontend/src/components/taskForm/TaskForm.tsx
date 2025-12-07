import { useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button } from '../ui/index';
import {
  TaskFormBasicFields,
  PrioritySelector,
  EquipmentManager,
  PDFUploadSection,
  RecurrenceSettings,
} from './index';
import { useTaskForm } from '../../hooks/useTaskForm';
import { activityService } from '../../services/activityService';
import type { Activity, RecurrenceConfig } from '../../types/types';

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
    pdfFile,
    setPdfFile,
    isEditing,
    handleAddEquipment,
    handleRemoveEquipment,
    buildTaskData,
  } = useTaskForm({ task, defaultStartTime, crewMemberId });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  // Recurring state
  const [isRecurring, setIsRecurring] = useState(task?.isRecurring || false);
  const [recurrence, setRecurrence] = useState<RecurrenceConfig | undefined>(
    task?.recurrence || {
      type: 'daily',
      interval: 1,
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) return;

    // Validate recurrence if enabled
    if (isRecurring) {
      if (recurrence?.type === 'weekly' && (!recurrence.daysOfWeek || recurrence.daysOfWeek.length === 0)) {
        alert('Please select at least one day of the week for weekly recurrence');
        return;
      }
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

    if (pdfFile && activityWithId && 'id' in activityWithId && activityWithId.id) {
      try {
        setUploadingPdf(true);
        const updated = await activityService.uploadPDF(activityWithId.id, pdfFile);
        onPdfUploaded?.(updated);
      } catch (error) {
        console.error('Failed to upload PDF:', error);
        alert(
          'Task saved successfully, but PDF upload failed. You can try uploading again by editing the task.'
        );
      } finally {
        setUploadingPdf(false);
      }
    }

    onClose();
  };

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Only PDF files are allowed');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('PDF file size must be less than 10MB');
        return;
      }
      setPdfFile(file);
    }
  };

  const handleRemovePdf = async () => {
    if (task?.id && task?.pdfUrl) {
      if (!confirm('Are you sure you want to remove this PDF?')) return;

      try {
        const updatedActivity = await activityService.deletePDF(task.id);
        setFormData((prev) => ({ ...prev, pdfUrl: undefined }));
        await onSubmit(updatedActivity);
      } catch (error) {
        console.error('Failed to delete PDF:', error);
        alert('Failed to delete PDF. Please try again.');
      }
    }
    setPdfFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = () => {
    if (task && onDelete) {
      onDelete(task.id);
      onClose();
    }
  };

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
            <label className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm sm:text-base text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500 focus:border-transparent resize-none"
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

          {/* Recurrence Settings - only show for new tasks or non-recurring tasks */}
          {(!isEditing || !task?.parentActivityId) && (
            <RecurrenceSettings
              isRecurring={isRecurring}
              recurrence={recurrence}
              missionEndDate={missionEndDate}
              onRecurringChange={setIsRecurring}
              onRecurrenceChange={setRecurrence}
            />
          )}

          {/* Show info if editing a recurring instance */}
          {isEditing && task?.parentActivityId && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                ℹ️ This is part of a recurring series. Changes will only affect this instance.
              </p>
            </div>
          )}

          <PDFUploadSection
            formData={formData}
            pdfFile={pdfFile}
            onPdfSelect={handlePdfSelect}
            onRemovePdf={handleRemovePdf}
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
