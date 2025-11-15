import { useState, useRef } from 'react';
import { FileText, X } from 'lucide-react';
import { Button } from '../ui/index';
import { cn } from '../../utils/utils';
import type { Activity } from '../../types/types';

interface PDFUploadSectionProps {
  formData: Partial<Activity>;
  pdfFile: File | null;
  onPdfSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePdf: () => void;
}

export const PDFUploadSection = ({
  formData,
  pdfFile,
  onPdfSelect,
  onRemovePdf,
}: PDFUploadSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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
      if (file.type !== 'application/pdf') {
        alert('Only PDF files are allowed');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('PDF file size must be less than 10MB');
        return;
      }

      const fakeEvent = {
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onPdfSelect(fakeEvent);
    }
  };

  return (
    <div className="space-y-2 sm:space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
      <label className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
        Attach PDF Document
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={onPdfSelect}
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
            {isDragging ? 'Drop PDF file here' : 'Click to select or drag & drop PDF file here'}
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
            onClick={onRemovePdf}
            className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
