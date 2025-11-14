import { Button } from '../ui';
import { ExternalLink } from 'lucide-react';

export const MorePagesInfo = ({
  remaining,
  openInNewTab,
}: {
  remaining: number;
  openInNewTab: () => void;
}) => (
  <div className="bg-slate-100 dark:bg-slate-800 p-4 text-center border-t border-slate-200 dark:border-slate-700">
    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-2">
      {remaining} more page{remaining > 1 ? 's' : ''}…
    </p>
    <Button variant="outline" size="sm" onClick={openInNewTab}>
      <ExternalLink className="h-3.5 w-3.5" />
      View Full Document
    </Button>
  </div>
);
