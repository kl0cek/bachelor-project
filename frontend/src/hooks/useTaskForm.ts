import { useState, useEffect } from 'react';
import type { Activity } from '../types/types';

interface UseTaskFormProps {
  task?: Activity | null;
  defaultStartTime: number;
  crewMemberId: string;
}

export const useTaskForm = ({ task, defaultStartTime, crewMemberId }: UseTaskFormProps) => {
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
  }, [task, defaultStartTime]);

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

  const buildTaskData = (): Activity => {
    return {
      id: task?.id || `${crewMemberId}-${Date.now()}`,
      crewMemberId,
      name: formData.name!.trim(),
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
  };

  return {
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
  };
};
