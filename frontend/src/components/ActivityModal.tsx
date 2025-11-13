import { useState } from 'react';
import { Clock, AlertCircle, Wrench, Edit3, MessageSquare, Send, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Badge } from './ui/index';
import { cn } from '../utils/utils';
import { formatTime } from '../utils/dateUtils';
import { useAuth } from '../hooks/useAuth';
import { useComments } from '../hooks/useComment';
import type { Activity, Priority, ActivityType } from '../types/types';

interface ActivityModalProps {
  activity: Activity | null;
  onClose: () => void;
  onEdit: (activity: Activity) => void;
}

export const ActivityModal = ({ activity, onClose, onEdit }: ActivityModalProps) => {
  const { user, hasRole } = useAuth();
  const {
    comments,
    loading: commentsLoading,
    addComment,
    deleteComment,
  } = useComments(activity?.id || null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!activity) return null;

  const startTime = formatTime(activity.start);
  const endTime = formatTime(activity.start + activity.duration);
  const isAstronaut = hasRole('astronaut');

  const priorityColors: Record<Exclude<Priority, undefined>, string> = {
    high: 'bg-orange-500 text-gray shadow-orange',
    medium: 'bg-sky-600 text-gray shadow-space',
    low: 'bg-slate-400 text-gray dark:bg-slate-600',
  };

  const typeLabels: Record<ActivityType, string> = {
    exercise: 'Exercise',
    meal: 'Meal',
    sleep: 'Sleep',
    work: 'Work',
    eva: 'EVA',
    optional: 'Optional',
  };

  const handleEdit = () => {
    onEdit(activity);
  };

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

  return (
    <Dialog open={!!activity} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3 sm:gap-6">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-slate-900 dark:text-slate-100 wrap-break-word">
                {activity.name}
              </DialogTitle>
              {activity.mission && (
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium truncate">
                  {activity.mission}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {activity.priority && (
                <Badge
                  className={cn(
                    'text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2',
                    priorityColors[activity.priority]
                  )}
                >
                  {activity.priority.toUpperCase()}
                </Badge>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={handleEdit}
                className="h-8 w-8 sm:h-9 sm:w-9 shrink-0"
                title="Edit task"
              >
                <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 md:space-y-8 pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
            <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 dark:text-slate-400 shrink-0" />
              <span className="text-slate-900 dark:text-slate-100 font-semibold">
                {startTime} - {endTime} UTC
              </span>
            </div>
            <Badge variant="outline" className="text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2 w-fit">
              {typeLabels[activity.type]}
            </Badge>
          </div>

          {activity.description && (
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 dark:text-slate-400 shrink-0" />
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Description
                </h3>
              </div>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed pl-6 sm:pl-8">
                {activity.description}
              </p>
            </div>
          )}

          {activity.equipment && activity.equipment.length > 0 && (
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <Wrench className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 dark:text-slate-400 shrink-0" />
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Equipment Required
                </h3>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3 pl-6 sm:pl-8">
                {activity.equipment.map((item, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="text-xs sm:text-sm px-2 sm:px-3 py-1"
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3 sm:space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 sm:gap-3">
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 dark:text-slate-400 shrink-0" />
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
                Notes & Comments
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                ({comments.length})
              </span>
            </div>

            <div className="space-y-3 pl-6 sm:pl-8 max-h-60 overflow-y-auto">
              {commentsLoading && (
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                  Loading comments...
                </p>
              )}

              {!commentsLoading && comments.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                  No comments yet. {isAstronaut && 'If needed add a note!'}
                </p>
              )}

              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 sm:p-4 space-y-2"
                >
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
                    {isAstronaut && user?.id === comment.userId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteComment(comment.id)}
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
              ))}
            </div>

            {isAstronaut && (
              <div className="pl-6 sm:pl-8 space-y-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a note or comment..."
                  className="w-full min-h-20 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 resize-y"
                  disabled={submitting}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || submitting}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {submitting ? 'Adding...' : 'Add Comment'}
                  </Button>
                </div>
              </div>
            )}

            {!isAstronaut && (
              <p className="pl-6 sm:pl-8 text-xs text-slate-500 dark:text-slate-400 italic">
                Only astronauts
              </p>
            )}
          </div>

          <div className="pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Duration:{' '}
                <span className="text-slate-900 dark:text-slate-100 font-semibold">
                  {activity.duration} hours
                </span>
              </p>
              <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-500 truncate">
                ID: {activity.id}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
