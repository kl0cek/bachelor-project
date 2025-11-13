import { apiClient } from '../api/client';
import type { ActivityComment } from '../types/types';
import type { BackendActivityComment, ApiResponse } from '../types/apiTypes';

class CommentService {
  async getCommentsByActivity(activityId: string): Promise<ActivityComment[]> {
    try {
      const response = await apiClient.get<ApiResponse<BackendActivityComment[]>>(
        `/comments/activities/${activityId}/comments`
      );

      const rawComments = response.data.data || [];
      return this.mapCommentsToFrontend(rawComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  async createComment(activityId: string, comment: string): Promise<ActivityComment> {
    try {
      const response = await apiClient.post<ApiResponse<BackendActivityComment>>(
        `/comments/activities/${activityId}/comments`,
        { comment }
      );

      return this.mapCommentToFrontend(response.data.data);
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  async updateComment(commentId: string, comment: string): Promise<ActivityComment> {
    try {
      const response = await apiClient.patch<ApiResponse<BackendActivityComment>>(
        `/comments/comments/${commentId}`,
        { comment }
      );

      return this.mapCommentToFrontend(response.data.data);
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  }

  async deleteComment(commentId: string): Promise<void> {
    try {
      await apiClient.delete(`/comments/comments/${commentId}`);
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  private mapCommentToFrontend(comment: BackendActivityComment): ActivityComment {
    return {
      id: comment.id,
      activityId: comment.activity_id,
      userId: comment.user_id,
      username: comment.username || '',
      fullName: comment.full_name || '',
      role: comment.role as any,
      comment: comment.comment,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
    };
  }

  private mapCommentsToFrontend(comments: BackendActivityComment[]): ActivityComment[] {
    if (!Array.isArray(comments)) {
      console.error('Expected array of comments, got:', typeof comments);
      return [];
    }
    return comments.map((c) => this.mapCommentToFrontend(c));
  }
}

export const commentService = new CommentService();
