import { useState, useMemo, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  Header,
  PreviewContainer,
  LoadingState,
  ErrorState,
  PageWrapper,
  MorePagesInfo,
} from './index';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

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
  const [pdfValid, setPdfValid] = useState<boolean>(false);

  const fullPdfUrl = useMemo(() => {
    if (/^https?:\/\//.test(pdfUrl)) {
      return pdfUrl;
    }

    const serverUrl = import.meta.env.VITE_SERVER_URL || 'https://localhost:3000';

    const normalizedPath = pdfUrl.startsWith('/') ? pdfUrl : `/${pdfUrl}`;
    
    const fullUrl = `${serverUrl}${normalizedPath}`;
    
    return fullUrl;
  }, [pdfUrl]);

  useEffect(() => {
    let isMounted = true;
    
    const validatePdf = async () => {
      try {
        const response = await fetch(fullPdfUrl, { 
          method: 'HEAD',
          credentials: 'include' 
        });
        
        console.log('📊 PDF Response:', {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type'),
          contentLength: response.headers.get('content-length'),
        });

        if (!isMounted) return;

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && !contentType.includes('pdf')) {
          throw new Error(`Backend returned ${contentType} instead of PDF - check server configuration`);
        }
        setPdfValid(true);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to validate PDF');
          setLoading(false);
          setPdfValid(false);
        }
      }
    };

    validatePdf();
    
    return () => {
      isMounted = false;
    };
  }, [fullPdfUrl]);

  const pagesToShow = Math.min(numPages ?? 0, maxPages);
  const hasMorePages = numPages && numPages > maxPages;

  const fileConfig = useMemo(() => ({
    url: fullPdfUrl,
    withCredentials: true,
  }), [fullPdfUrl]);

  const pdfOptions = useMemo(() => ({
    standardFontDataUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
    cMapUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
  }), []);

  const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const handleLoadError = (error: Error) => {
    let errorMessage = 'Failed to load PDF';

    if (error.message.includes('Invalid PDF structure')) {
      errorMessage = 'Invalid PDF file - the file may be corrupted or not a valid PDF';
    } else if (error.message.includes('404')) {
      errorMessage = 'PDF file not found on server';
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Network error - check your connection and server status';
    }
    
    setError(errorMessage);
    setLoading(false);
  };

  const openInNewTab = () => {
    window.open(fullPdfUrl, '_blank');
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <Header
        isPreviewVisible={isPreviewVisible}
        togglePreview={() => setIsPreviewVisible(!isPreviewVisible)}
        numPages={numPages}
        openInNewTab={openInNewTab}
      />

      {isPreviewVisible && (
        <PreviewContainer>
          {loading && !error && <LoadingState />}
          {error && <ErrorState error={error} onRetry={openInNewTab} />}

          {!error && pdfValid && (
            <Document
              key={fullPdfUrl}
              file={fileConfig}
              onLoadSuccess={handleLoadSuccess}
              onLoadError={handleLoadError}
              loading=""
              error=""
              className="flex flex-col items-center"
              options={pdfOptions}
            >
              {Array.from({ length: pagesToShow }).map((_, i) => (
                <PageWrapper key={i}>
                  <Page
                    pageNumber={i + 1}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="max-w-full"
                    width={Math.min(window.innerWidth - 100, 600)}
                    loading=""
                    error=""
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
