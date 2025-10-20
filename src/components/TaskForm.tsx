import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Dialog';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { cn } from '../utils/utils';
import type { Activity, ActivityType, Priority } from '../types/types';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Activity) => void;
  onDelete?: (taskId: string) => void;
  task?: Activity | null;
  crewMemberId: string;
  defaultStartTime?: number;
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
  }, [task, defaultStartTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) return;

    const taskData: Activity = {
      id: task?.id || `${crewMemberId}-${Date.now()}`,
      name: formData.name.trim(),
      start: formData.start || defaultStartTime,
      duration: formData.duration || 1,
      type: formData.type || 'work',
      mission: formData.mission?.trim() || undefined,
      description: formData.description?.trim() || undefined,
      equipment: formData.equipment?.filter((item) => item.trim()) || [],
      priority: formData.priority || 'medium',
    };

    onSubmit(taskData);
    onClose();
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
    { value: 'high', label: 'High', color: 'bg-orange-500 text-white' },
    { value: 'medium', label: 'Medium', color: 'bg-space-600 text-white' },
    { value: 'low', label: 'Low', color: 'bg-slate-400 text-white dark:bg-slate-600' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{isEditing ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            {isEditing && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Task Name *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500 focus:border-transparent"
                placeholder="Enter task name"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Mission
              </label>
              <input
                type="text"
                value={formData.mission || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, mission: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500 focus:border-transparent"
                placeholder="Mission name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Start Time (GMT)
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
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
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
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Activity Type
              </label>
              <select
                value={formData.type || 'work'}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, type: e.target.value as ActivityType }))
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500 focus:border-transparent"
              >
                {activityTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Priority
              </label>
              <div className="flex gap-2">
                {priorities.map((priority) => (
                  <button
                    key={priority.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, priority: priority.value }))}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all',
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

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500 focus:border-transparent resize-none"
              placeholder="Task description..."
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Equipment Required
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={newEquipment}
                onChange={(e) => setNewEquipment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEquipment())}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500 focus:border-transparent"
                placeholder="Add equipment..."
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddEquipment}
                className="shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.equipment && formData.equipment.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.equipment.map((item, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-2 text-sm px-3 py-1"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => handleRemoveEquipment(index)}
                      className="ml-1 hover:text-orange-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? 'Update Task' : 'Create Task'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
