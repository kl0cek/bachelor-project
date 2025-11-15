import { useRef } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import { Button } from '../ui/index';
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

  return (
    <div className="space-y-2 sm:space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
      <label className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
        Attach PDF Document
      </label>

      {!pdfFile && !formData.pdfUrl ? (
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 sm:p-6 text-center">
          <FileText className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 text-slate-400" />
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3">
            Upload a PDF document (max 10MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={onPdfSelect}
            className="hidden"
            id="pdf-upload"
          />
          <label htmlFor="pdf-upload">
            <Button type="button" variant="outline" size="sm">
              <span className="cursor-pointer flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Choose PDF
              </span>
            </Button>
          </label>
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
