import { Button } from '../ui';
import { ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';

export const Header = ({
  isPreviewVisible,
  togglePreview,
  numPages,
  openInNewTab,
}: {
  isPreviewVisible: boolean;
  togglePreview: () => void;
  numPages: number | null;
  openInNewTab: () => void;
}) => (
  <div className="flex items-center justify-between gap-2">
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={togglePreview} className="flex items-center gap-2">
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

      {numPages && (
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          {numPages} page{numPages > 1 ? 's' : ''}
        </p>
      )}
    </div>

    <Button variant="outline" size="sm" onClick={openInNewTab} className="flex items-center gap-2">
      <ExternalLink className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Open Full PDF</span>
    </Button>
  </div>
);
