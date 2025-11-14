import { AppDataSource } from '../config/database';
import { ActivityComment } from '../entities/ActivityComment.entity';
import { Activity } from '../entities/Activity.entity';

interface CreateCommentData {
  activity_id: string;
  user_id: string;
  comment: string;
}

interface UpdateCommentData {
  comment: string;
}

class CommentService {
  private commentRepository = AppDataSource.getRepository(ActivityComment);
  private activityRepository = AppDataSource.getRepository(Activity);

  async getByActivity(activityId: string) {
    const activity = await this.activityRepository.findOne({
      where: { id: activityId },
    });

    if (!activity) {
      throw new Error('Activity not found');
    }

    const comments = await this.commentRepository.find({
      where: { activity_id: activityId },
      relations: ['user'],
      order: { created_at: 'ASC' },
    });

    return comments.map((comment) => ({
      id: comment.id,
      activity_id: comment.activity_id,
      user_id: comment.user_id,
      comment: comment.comment,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      username: comment.user.username,
      full_name: comment.user.full_name,
      role: comment.user.role,
    }));
  }

  async getById(commentId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    return comment;
  }

  async create(data: CreateCommentData) {
    const activity = await this.activityRepository.findOne({
      where: { id: data.activity_id },
    });

    if (!activity) {
      throw new Error('Activity not found');
    }

    const comment = this.commentRepository.create({
      activity_id: data.activity_id,
      user_id: data.user_id,
      comment: data.comment,
    });

    const savedComment = await this.commentRepository.save(comment);

    const commentWithUser = await this.commentRepository.findOne({
      where: { id: savedComment.id },
      relations: ['user'],
    });

    if (!commentWithUser) {
      throw new Error('Failed to retrieve created comment');
    }

    return {
      id: commentWithUser.id,
      activity_id: commentWithUser.activity_id,
      user_id: commentWithUser.user_id,
      comment: commentWithUser.comment,
      created_at: commentWithUser.created_at,
      updated_at: commentWithUser.updated_at,
      username: commentWithUser.user.username,
      full_name: commentWithUser.user.full_name,
      role: commentWithUser.user.role,
    };
  }

  async update(commentId: string, data: UpdateCommentData) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    comment.comment = data.comment;
    const updated = await this.commentRepository.save(comment);

    const commentWithUser = await this.commentRepository.findOne({
      where: { id: updated.id },
      relations: ['user'],
    });

    if (!commentWithUser) {
      throw new Error('Failed to retrieve updated comment');
    }

    return {
      id: commentWithUser.id,
      activity_id: commentWithUser.activity_id,
      user_id: commentWithUser.user_id,
      comment: commentWithUser.comment,
      created_at: commentWithUser.created_at,
      updated_at: commentWithUser.updated_at,
      username: commentWithUser.user.username,
      full_name: commentWithUser.user.full_name,
      role: commentWithUser.user.role,
    };
  }

  async delete(commentId: string) {
    const result = await this.commentRepository.delete(commentId);

    if (result.affected === 0) {
      throw new Error('Comment not found');
    }
  }

  async getCountByActivity(activityId: string): Promise<number> {
    return this.commentRepository.count({
      where: { activity_id: activityId },
    });
  }

  async getByUser(userId: string) {
    return this.commentRepository.find({
      where: { user_id: userId },
      relations: ['activity', 'user'],
      order: { created_at: 'DESC' },
    });
  }
}

export const commentService = new CommentService();
