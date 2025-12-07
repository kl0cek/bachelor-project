import { Router } from 'express';
import { activityController } from '../controllers/activity.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { uploadPDF } from '../middleware/upload.middleware';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validator.middleware';

const router = Router();

router.use(authenticate);

const createActivityValidation = [
  body('crew_member_id').isUUID(),
  body('mission_id').isUUID(),
  body('name').notEmpty().trim().isLength({ max: 200 }),
  body('date').isISO8601(),
  body('start_hour').isFloat({ min: 0, max: 24 }),
  body('duration').isFloat({ min: 0.1, max: 24 }),
  body('type').isIn(['exercise', 'meal', 'sleep', 'work', 'eva', 'optional']),
  body('priority').optional().isIn(['high', 'medium', 'low']),
  body('mission').optional().isString(),
  body('description').optional().isString(),
  body('equipment').optional().isArray(),
  body('is_recurring').optional().isBoolean(),
  body('recurrence').optional().isObject(),
  body('recurrence.type').optional().isIn(['daily', 'weekly', 'custom']),
  body('recurrence.interval').optional().isInt({ min: 1 }),
  body('recurrence.daysOfWeek').optional().isArray(),
  body('recurrence.endDate').optional().isISO8601(),
];

const updateActivityValidation = [
  param('id').isUUID(),
  body('name').optional().trim().isLength({ max: 200 }),
  body('date').optional().isISO8601(),
  body('start_hour').optional().isFloat({ min: 0, max: 24 }),
  body('duration').optional().isFloat({ min: 0.1, max: 24 }),
  body('type').optional().isIn(['exercise', 'meal', 'sleep', 'work', 'eva', 'optional']),
  body('priority').optional().isIn(['high', 'medium', 'low']),
  body('mission').optional().isString(),
  body('description').optional().isString(),
  body('equipment').optional().isArray(),
];

router.post(
  '/missions/:missionId/activities',
  requirePermission('manage_activities'),
  createActivityValidation,
  validate,
  activityController.create
);

router.get(
  '/missions/:missionId/activities',
  query('date').notEmpty().isISO8601(),
  validate,
  activityController.getByMissionAndDate
);

router.get(
  '/crew/:crewId/activities',
  query('date').notEmpty().isISO8601(),
  validate,
  activityController.getByCrewAndDate
);

router.get(
  '/crew/:crewId/available-slots',
  query('date').notEmpty().isISO8601(),
  query('duration').notEmpty().isFloat(),
  validate,
  activityController.getAvailableSlots
);

router.get('/:id', param('id').isUUID(), validate, activityController.getById);

router.patch(
  '/:id',
  requirePermission('manage_activities'),
  updateActivityValidation,
  validate,
  activityController.update
);

router.patch(
  '/recurring/:parentId/all',
  requirePermission('manage_activities'),
  param('parentId').isUUID(),
  updateActivityValidation,
  validate,
  activityController.updateRecurring
);

router.delete(
  '/recurring/:parentId/all',
  requirePermission('manage_activities'),
  param('parentId').isUUID(),
  validate,
  activityController.deleteRecurring
);

router.post(
  '/:id/upload-pdf',
  requirePermission('manage_activities'),
  param('id').isUUID(),
  validate,
  uploadPDF.single('pdf'),
  activityController.uploadPDF
);

router.delete(
  '/:id/pdf',
  requirePermission('manage_activities'),
  param('id').isUUID(),
  validate,
  activityController.deletePDF
);

router.delete(
  '/:id',
  requirePermission('manage_activities'),
  param('id').isUUID(),
  validate,
  activityController.delete
);

export default router;
