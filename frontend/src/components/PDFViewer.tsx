import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ExternalLink, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/index';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import workerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
interface PDFViewerProps {
  pdfUrl: string;
  maxPages?: number;
}

export const PDFViewer = ({ pdfUrl, maxPages = 3 }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  const getFullPdfUrl = () => {
    if (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://')) {
      return pdfUrl;
    }

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const cleanBaseUrl = baseUrl.replace(/\/api$/, '');

    return `${cleanBaseUrl}${pdfUrl}`;
  };

  const fullPdfUrl = getFullPdfUrl();

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF');
    setLoading(false);
  };

  const handleOpenInNewTab = () => {
    window.open(fullPdfUrl, '_blank');
  };

  const togglePreview = () => {
    setIsPreviewVisible(!isPreviewVisible);
  };

  const pagesToShow = Math.min(numPages || 0, maxPages);
  const hasMorePages = numPages && numPages > maxPages;

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={togglePreview}
            className="flex items-center gap-2"
          >
            {isPreviewVisible ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                <span>Hide Preview</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                <span>Show Preview</span>
              </>
            )}
          </Button>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {numPages && (
              <>
                {numPages} page{numPages > 1 ? 's' : ''}
              </>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenInNewTab}
          className="flex items-center gap-2"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Open Full PDF</span>
        </Button>
      </div>

      {isPreviewVisible && (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-12 text-red-600">
              <p className="text-sm font-medium">{error}</p>
              <Button variant="outline" size="sm" onClick={handleOpenInNewTab} className="mt-4">
                Try opening in new tab
              </Button>
            </div>
          )}

          {!error && (
            <Document
              file={fullPdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading=""
              className="flex flex-col items-center"
            >
              {Array.from({ length: pagesToShow }, (_, index) => (
                <div
                  key={index}
                  className="border-b border-slate-200 dark:border-slate-700 last:border-b-0"
                >
                  <Page
                    pageNumber={index + 1}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="max-w-full"
                    width={Math.min(window.innerWidth - 100, 600)}
                  />
                </div>
              ))}
            </Document>
          )}

          {hasMorePages && !loading && !error && (
            <div className="bg-slate-100 dark:bg-slate-800 p-3 sm:p-4 text-center border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-2">
                {numPages! - maxPages} more page{numPages! - maxPages > 1 ? 's' : ''}...
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
                className="flex items-center gap-2 mx-auto"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View Full Document
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
