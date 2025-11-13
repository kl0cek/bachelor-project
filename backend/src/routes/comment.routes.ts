import { Router } from 'express';
import { commentController } from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validator.middleware';

const router = Router();

router.use(authenticate);

const createCommentValidation = [
  body('comment').notEmpty().trim().isLength({ min: 1, max: 2000 }).withMessage('Comment must be 1-2000 characters'),
];

const updateCommentValidation = [
  param('id').isUUID().withMessage('Valid comment ID required'),
  body('comment').notEmpty().trim().isLength({ min: 1, max: 2000 }).withMessage('Comment must be 1-2000 characters'),
];

router.get(
  '/activities/:activityId/comments',
  param('activityId').isUUID(),
  validate,
  commentController.getByActivity
);

router.post(
  '/activities/:activityId/comments',
  requirePermission('add_comment'),
  createCommentValidation,
  validate,
  commentController.create
);

router.patch(
  '/comments/:id',
  requirePermission('add_comment'),
  updateCommentValidation,
  validate,
  commentController.update
);

router.delete(
  '/comments/:id',
  requirePermission('add_comment'),
  param('id').isUUID(),
  validate,
  commentController.delete
);

export default router;
