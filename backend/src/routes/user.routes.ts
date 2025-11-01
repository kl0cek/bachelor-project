import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware'
import { UserRole } from '../entities/User.entity';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validator.middleware';

const router = Router();

// All routes require authentication and admin/operator role
router.use(authenticate);
router.use(requireRole(UserRole.ADMIN, UserRole.OPERATOR));

// Validation schemas
const createUserValidation = [
  body('username').notEmpty().trim().isLength({ min: 3, max: 50 }),
  body('password').notEmpty().isLength({ min: 6 }),
  body('full_name').notEmpty().trim().isLength({ min: 2, max: 100 }),
  body('email').optional().isEmail(),
  body('role').isIn(['admin', 'operator', 'astronaut', 'viewer']),
  body('is_active').optional().isBoolean(),
];

const updateUserValidation = [
  param('id').isUUID(),
  body('username').optional().trim().isLength({ min: 3, max: 50 }),
  body('password').optional().isLength({ min: 6 }),
  body('full_name').optional().trim().isLength({ min: 2, max: 100 }),
  body('email').optional().isEmail(),
  body('role').optional().isIn(['admin', 'operator', 'astronaut', 'viewer']),
  body('is_active').optional().isBoolean(),
];

// Routes
router.get(
  '/',
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate,
  userController.getAll
);

router.post(
  '/',
  requireRole(UserRole.ADMIN),
  createUserValidation,
  validate,
  userController.create
);

router.get(
  '/:id',
  param('id').isUUID(),
  validate,
  userController.getById
);

router.patch(
  '/:id',
  requireRole(UserRole.ADMIN),
  updateUserValidation,
  validate,
  userController.update
);

router.delete(
  '/:id',
  requireRole(UserRole.ADMIN),
  param('id').isUUID(),
  validate,
  userController.delete
);

router.patch(
  '/:id/toggle',
  requireRole(UserRole.ADMIN),
  param('id').isUUID(),
  validate,
  userController.toggleStatus
);

export default router;
