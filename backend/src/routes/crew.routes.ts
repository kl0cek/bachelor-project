import { Router } from 'express';
import { crewController } from '../controllers/crew.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware'
import { body, param } from 'express-validator';
import { validate } from '../middleware/validator.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation schemas
const createCrewValidation = [
  body('mission_id').isUUID(),
  body('name').notEmpty().trim().isLength({ max: 100 }),
  body('role').optional().isString(),
  body('email').optional().isEmail(),
  body('user_id').optional().isUUID(),
];

// Routes
router.get(
  '/missions/:missionId/crew',
  param('missionId').isUUID(),
  validate,
  crewController.getByMission
);

router.post(
  '/missions/:missionId/crew',
  requirePermission('manage_crew'),
  param('missionId').isUUID(),
  createCrewValidation,
  validate,
  crewController.create
);

router.get(
  '/:id',
  param('id').isUUID(),
  validate,
  crewController.getById
);

router.patch(
  '/:id',
  requirePermission('manage_crew'),
  param('id').isUUID(),
  validate,
  crewController.update
);

router.delete(
  '/:id',
  requirePermission('manage_crew'),
  param('id').isUUID(),
  validate,
  crewController.delete
);

export default router;
