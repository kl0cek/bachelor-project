import { useState, useEffect, useCallback } from 'react';
import { commentService } from '../services/commentService';
import type { ActivityComment } from '../types/types';

export const useComments = (activityId: string | null) => {
  const [comments, setComments] = useState<ActivityComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!activityId) {
      setComments([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await commentService.getCommentsByActivity(activityId);
      setComments(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch comments';
      console.error('Error fetching comments:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [activityId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (comment: string) => {
    if (!activityId) return;

    try {
      setError(null);
      const newComment = await commentService.createComment(activityId, comment);
      setComments((prev) => [...prev, newComment]);
      return newComment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add comment';
      setError(errorMessage);
      throw err;
    }
  };

  const updateComment = async (commentId: string, newText: string) => {
    try {
      setError(null);
      const updated = await commentService.updateComment(commentId, newText);
      setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update comment';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      setError(null);
      await commentService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete comment';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    comments,
    loading,
    error,
    refetch: fetchComments,
    addComment,
    updateComment,
    deleteComment,
  };
};
