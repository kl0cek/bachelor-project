import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { CommentItem, CommentForm } from './index';
import { useAuth } from '../../hooks/useAuth';
import { useComments } from '../../hooks/useComment';

interface CommentsSectionProps {
  activityId: string;
}

export const CommentsSection = ({ activityId }: CommentsSectionProps) => {
  const { user, hasRole } = useAuth();
  const { comments, loading, addComment, deleteComment } = useComments(activityId);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAstronaut = hasRole('astronaut');

  const handleAddComment = async () => {
    if (!newComment.trim() || !isAstronaut) return;

    try {
      setSubmitting(true);
      await addComment(newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await deleteComment(commentId);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 sm:gap-3">
        <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 dark:text-slate-400 shrink-0" />
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
          Notes & Comments
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">({comments.length})</span>
      </div>

      <div className="space-y-3 pl-6 sm:pl-8 max-h-60 overflow-y-auto">
        {loading && (
          <p className="text-sm text-slate-500 dark:text-slate-400 italic">Loading comments...</p>
        )}

        {!loading && comments.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400 italic">
            No comments yet. {isAstronaut && 'If needed add a note!'}
          </p>
        )}

        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            canDelete={isAstronaut && user?.id === comment.userId}
            onDelete={handleDeleteComment}
          />
        ))}
      </div>

      {isAstronaut ? (
        <CommentForm
          value={newComment}
          onChange={setNewComment}
          onSubmit={handleAddComment}
          disabled={submitting}
        />
      ) : (
        <p className="pl-6 sm:pl-8 text-xs text-slate-500 dark:text-slate-400 italic">
          Only astronauts
        </p>
      )}
    </div>
  );
};
