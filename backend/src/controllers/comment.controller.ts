import { Request, Response } from 'express';
import { commentService } from '../services/comment.service';

class CommentController {
  async getByActivity(req: Request, res: Response) {
    try {
      const { activityId } = req.params;
      const comments = await commentService.getByActivity(activityId);

      res.json({
        success: true,
        data: comments,
      });
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch comments',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { activityId } = req.params;
      const { comment } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const newComment = await commentService.create({
        activity_id: activityId,
        user_id: userId,
        comment,
      });

      res.status(201).json({
        success: true,
        data: newComment,
        message: 'Comment added successfully',
      });
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create comment',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { comment } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const existingComment = await commentService.getById(id);
      if (!existingComment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found',
        });
      }

      if (existingComment.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only edit your own comments',
        });
      }

      const updated = await commentService.update(id, { comment });

      res.json({
        success: true,
        data: updated,
        message: 'Comment updated successfully',
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update comment',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const existingComment = await commentService.getById(id);
      if (!existingComment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found',
        });
      }

      if (existingComment.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own comments',
        });
      }

      await commentService.delete(id);

      res.json({
        success: true,
        message: 'Comment deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete comment',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const commentController = new CommentController();
