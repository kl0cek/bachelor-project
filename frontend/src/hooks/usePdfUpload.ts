import { useRef, useState } from 'react';
import { activityService } from '../services/activityService';
import type { Activity } from '../types/types';

interface UsePdfUploadProps {
  task?: Activity | null;
  onPdfUploaded?: (activity: Activity) => void;
  onSubmit: (task: Activity) => Promise<Activity | void>;
}

export const usePdfUpload = ({ task, onPdfUploaded, onSubmit }: UsePdfUploadProps) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('PDF file size must be less than 10MB');
      return;
    }

    setPdfFile(file);
  };

  const handleRemovePdf = async (
    setFormData: React.Dispatch<React.SetStateAction<Partial<Activity>>>
  ) => {
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

  const uploadPdfIfNeeded = async (activityWithId: Activity) => {
    if (!pdfFile || !activityWithId?.id) return;

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
  };

  return {
    pdfFile,
    setPdfFile,
    uploadingPdf,
    fileInputRef,
    handlePdfSelect,
    handleRemovePdf,
    uploadPdfIfNeeded,
  };
};
