import { Trash2 } from 'lucide-react';
import { Button, Badge } from '../ui/index';
import type { ActivityComment } from '../../types/types';

interface CommentItemProps {
  comment: ActivityComment;
  canDelete: boolean;
  onDelete: (commentId: string) => void;
}

const formatCommentDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const CommentItem = ({ comment, canDelete, onDelete }: CommentItemProps) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 sm:p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {comment.fullName}
            </span>
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              {comment.role}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {formatCommentDate(comment.createdAt)}
          </p>
        </div>
        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(comment.id)}
            className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
            title="Delete comment"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap wrap-break-words">
        {comment.comment}
      </p>
    </div>
  );
};
