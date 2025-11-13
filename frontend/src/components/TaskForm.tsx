import { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Badge } from './ui/index';
import { cn } from '../utils/utils';
import { activityService } from '../services/activityService';
import type { Activity, ActivityType, Priority } from '../types/types';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Activity) => void;
  onDelete?: (taskId: string) => void;
  task?: Activity | null;
  crewMemberId: string;
  defaultStartTime?: number;
  date: string;
}

export const TaskForm = ({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  task,
  crewMemberId,
  defaultStartTime = 6,
}: TaskFormProps) => {
  const [formData, setFormData] = useState<Partial<Activity>>({
    name: '',
    start: defaultStartTime,
    duration: 1,
    type: 'work',
    mission: '',
    description: '',
    equipment: [],
    priority: 'medium',
  });
  const [newEquipment, setNewEquipment] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!task;

  useEffect(() => {
    if (task) {
      setFormData(task);
    } else {
      setFormData({
        name: '',
        start: defaultStartTime,
        duration: 1,
        type: 'work',
        mission: '',
        description: '',
        equipment: [],
        priority: 'medium',
      });
    }
    setPdfFile(null);
    setIsDragging(false);
  }, [task, defaultStartTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) return;

    const taskData: Activity = {
      id: task?.id || `${crewMemberId}-${Date.now()}`,
      crewMemberId,
      name: formData.name.trim(),
      start: formData.start || defaultStartTime,
      duration: formData.duration || 1,
      type: formData.type || 'work',
      mission: formData.mission?.trim() || undefined,
      description: formData.description?.trim() || undefined,
      equipment: formData.equipment?.filter((item) => item.trim()) || [],
      priority: formData.priority || 'medium',
      date: new Date().toISOString().split('T')[0],
      pdfUrl: formData.pdfUrl,
    };

    onSubmit(taskData);

    if (pdfFile && task?.id) {
      try {
        setUploadingPdf(true);
        await activityService.uploadPDF(task.id, pdfFile);
      } catch (error) {
        console.error('Failed to upload PDF:', error);
        alert('Task saved but PDF upload failed. Please try again.');
      } finally {
        setUploadingPdf(false);
      }
    }

    onClose();
  };

  const validateAndSetPdfFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('PDF file size must be less than 10MB');
      return false;
    }
    setPdfFile(file);
    return true;
  };

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetPdfFile(file);
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetPdfFile(file);
    }
  };

  const handleRemovePdf = async () => {
    if (task?.id && task?.pdfUrl) {
      if (!confirm('Are you sure you want to remove this PDF?')) return;

      try {
        await activityService.deletePDF(task.id);
        setFormData((prev) => ({ ...prev, pdfUrl: undefined }));
      } catch (error) {
        console.error('Failed to delete PDF:', error);
        alert('Failed to delete PDF');
      }
    }
    setPdfFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddEquipment = () => {
    if (newEquipment.trim()) {
      setFormData((prev) => ({
        ...prev,
        equipment: [...(prev.equipment || []), newEquipment.trim()],
      }));
      setNewEquipment('');
    }
  };

  const handleRemoveEquipment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      equipment: prev.equipment?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleDelete = () => {
    if (task && onDelete) {
      onDelete(task.id);
      onClose();
    }
  };

  const activityTypes: { value: ActivityType; label: string }[] = [
    { value: 'work', label: 'Work / Research' },
    { value: 'exercise', label: 'Exercise' },
    { value: 'eva', label: 'EVA / Spacewalk' },
    { value: 'meal', label: 'Meal' },
    { value: 'sleep', label: 'Sleep' },
    { value: 'optional', label: 'Optional' },
  ];

  const priorities: { value: Priority; label: string; color: string }[] = [
    { value: 'high', label: 'High', color: 'bg-orange-500 dark:text-white text-sky-950' },
    { value: 'medium', label: 'Medium', color: 'bg-sky-600 dark:text-white text-sky-950' },
    {
      value: 'low',
      label: 'Low',
      color: 'bg-slate-400 dark:text-white text-sky-950 dark:bg-slate-600',
    },
  ];

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                Task Name *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm sm:text-base text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500 focus:border-transparent"
                placeholder="Enter task name"
                required
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                Mission
              </label>
              <input
                type="text"
                value={formData.mission || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, mission: e.target.value }))}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm sm:text-base text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500 focus:border-transparent"
                placeholder="Mission name"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                Start Time (UTC)
              </label>
              <input
                type="number"
                min="0"
                max="23.75"
                step="0.25"
                value={formData.start || defaultStartTime}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, start: parseFloat(e.target.value) }))
                }
                className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm sm:text-base text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                Duration (hours)
              </label>
              <input
                type="number"
                min="0.25"
                max="12"
                step="0.25"
                value={formData.duration || 1}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, duration: parseFloat(e.target.value) }))
                }
                className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm sm:text-base text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                Activity Type
              </label>
              <select
                value={formData.type || 'work'}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, type: e.target.value as ActivityType }))
                }
                className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm sm:text-base text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500 focus:border-transparent"
              >
                {activityTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                Priority
              </label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {priorities.map((priority) => (
                  <button
                    key={priority.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, priority: priority.value }))}
                    className={cn(
                      'px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all',
                      formData.priority === priority.value
                        ? priority.color
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                    )}
                  >
                    {priority.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

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

          <div className="space-y-2 sm:space-y-3">
            <label className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
              Equipment Required
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={newEquipment}
                onChange={(e) => setNewEquipment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEquipment())}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500 focus:border-transparent"
                placeholder="Add equipment..."
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddEquipment}
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
                      onClick={() => handleRemoveEquipment(index)}
                      className="ml-0.5 sm:ml-1 hover:text-orange-500 shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2 sm:space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <label className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
              Attach PDF Document
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handlePdfSelect}
              className="hidden"
            />

            {!pdfFile && !formData.pdfUrl ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleFileInputClick}
                className={cn(
                  'border-2 border-dashed rounded-lg p-4 sm:p-6 text-center cursor-pointer transition-all',
                  isDragging
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/20'
                    : 'border-slate-300 dark:border-slate-600 hover:border-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                )}
              >
                <FileText
                  className={cn(
                    'h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 transition-colors',
                    isDragging ? 'text-sky-500' : 'text-slate-400'
                  )}
                />
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {isDragging
                    ? 'Drop PDF file here'
                    : 'Click to select or drag & drop PDF file here'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">Max 10MB</p>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 sm:p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <FileText className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {pdfFile?.name || 'Attached PDF'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {pdfFile ? `${(pdfFile.size / 1024 / 1024).toFixed(2)} MB` : 'Click to view'}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleRemovePdf}
                  className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:w-auto">
              <span className="dark:text-white text-sky-950">Cancel</span>
            </Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={uploadingPdf}>
              <span className="dark:text-white text-sky-950">
                {uploadingPdf ? 'Uploading...' : isEditing ? 'Update Task' : 'Create Task'}
              </span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
