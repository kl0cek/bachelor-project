import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.middleware';

const router = Router();

// Login validation
const loginValidation = [
  body('username').notEmpty().trim().isLength({ min: 3 }),
  body('password').notEmpty().isLength({ min: 6 }),
];

// Routes
router.post(
  '/login',
  loginValidation,
  validate,
  authController.login
);

router.post(
  '/logout',
  authenticate,
  body('refreshToken').notEmpty(),
  validate,
  authController.logout
);

router.post(
  '/refresh',
  body('refreshToken').notEmpty(),
  validate,
  authController.refresh
);

router.get(
  '/me',
  authenticate,
  authController.getCurrentUser
);

export default router;
