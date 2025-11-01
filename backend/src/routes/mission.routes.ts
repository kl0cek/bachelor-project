import { Router } from 'express';
import { missionController } from '../controllers/mission.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware'
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validator.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation schemas
const createMissionValidation = [
  body('name').notEmpty().trim().isLength({ max: 200 }),
  body('description').notEmpty().trim(),
  body('start_date').isISO8601(),
  body('end_date').isISO8601(),
  body('status')
    .optional()
    .isIn(['planning', 'active', 'completed', 'cancelled']),
];

const updateMissionValidation = [
  param('id').isUUID(),
  body('name').optional().trim().isLength({ max: 200 }),
  body('description').optional().trim(),
  body('start_date').optional().isISO8601(),
  body('end_date').optional().isISO8601(),
  body('status')
    .optional()
    .isIn(['planning', 'active', 'completed', 'cancelled']),
];

// Routes
router.get(
  '/',
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate,
  missionController.getAll
);

router.get('/active', missionController.getActive);

router.post(
  '/',
  requirePermission('create_mission'),
  createMissionValidation,
  validate,
  missionController.create
);

router.get(
  '/:id',
  param('id').isUUID(),
  validate,
  missionController.getById
);

router.patch(
  '/:id',
  requirePermission('edit_mission'),
  updateMissionValidation,
  validate,
  missionController.update
);

router.delete(
  '/:id',
  requirePermission('edit_mission'),
  param('id').isUUID(),
  validate,
  missionController.delete
);

export default router;
