import { useState, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  Header,
  PreviewContainer,
  LoadingState,
  ErrorState,
  PageWrapper,
  MorePagesInfo,
} from './index';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  pdfUrl: string;
  maxPages?: number;
}

export const PDFViewer = ({ pdfUrl, maxPages = 3 }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  const fullPdfUrl = useMemo(() => {
    if (/^https?:\/\//.test(pdfUrl)) return pdfUrl;

    const base = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/api$/, '');

    return `${base}${pdfUrl}`;
  }, [pdfUrl]);

  const pagesToShow = Math.min(numPages ?? 0, maxPages);
  const hasMorePages = numPages && numPages > maxPages;

  const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const handleLoadError = () => {
    setError('Failed to load PDF');
    setLoading(false);
  };

  const openInNewTab = () => window.open(fullPdfUrl, '_blank');

  return (
    <div className="space-y-4">
      <Header
        isPreviewVisible={isPreviewVisible}
        togglePreview={() => setIsPreviewVisible(!isPreviewVisible)}
        numPages={numPages}
        openInNewTab={openInNewTab}
      />

      {isPreviewVisible && (
        <PreviewContainer>
          {loading && <LoadingState />}
          {error && <ErrorState error={error} onRetry={openInNewTab} />}

          {!error && (
            <Document
              file={fullPdfUrl}
              onLoadSuccess={handleLoadSuccess}
              onLoadError={handleLoadError}
              loading=""
              className="flex flex-col items-center"
            >
              {Array.from({ length: pagesToShow }).map((_, i) => (
                <PageWrapper key={i}>
                  <Page
                    pageNumber={i + 1}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    width={Math.min(window.innerWidth - 100, 600)}
                  />
                </PageWrapper>
              ))}
            </Document>
          )}

          {hasMorePages && !loading && !error && (
            <MorePagesInfo remaining={numPages! - maxPages} openInNewTab={openInNewTab} />
          )}
        </PreviewContainer>
      )}
    </div>
  );
};
