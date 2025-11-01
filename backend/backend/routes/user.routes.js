"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const User_entity_1 = require("../entities/User.entity");
const express_validator_1 = require("express-validator");
const validator_middleware_1 = require("../middleware/validator.middleware");
const router = (0, express_1.Router)();
// All routes require authentication and admin/operator role
router.use(auth_middleware_1.authenticate);
router.use((0, rbac_middleware_1.requireRole)(User_entity_1.UserRole.ADMIN, User_entity_1.UserRole.OPERATOR));
// Validation schemas
const createUserValidation = [
    (0, express_validator_1.body)('username').notEmpty().trim().isLength({ min: 3, max: 50 }),
    (0, express_validator_1.body)('password').notEmpty().isLength({ min: 6 }),
    (0, express_validator_1.body)('full_name').notEmpty().trim().isLength({ min: 2, max: 100 }),
    (0, express_validator_1.body)('email').optional().isEmail(),
    (0, express_validator_1.body)('role').isIn(['admin', 'operator', 'astronaut', 'viewer']),
    (0, express_validator_1.body)('is_active').optional().isBoolean(),
];
const updateUserValidation = [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('username').optional().trim().isLength({ min: 3, max: 50 }),
    (0, express_validator_1.body)('password').optional().isLength({ min: 6 }),
    (0, express_validator_1.body)('full_name').optional().trim().isLength({ min: 2, max: 100 }),
    (0, express_validator_1.body)('email').optional().isEmail(),
    (0, express_validator_1.body)('role').optional().isIn(['admin', 'operator', 'astronaut', 'viewer']),
    (0, express_validator_1.body)('is_active').optional().isBoolean(),
];
// Routes
router.get('/', (0, express_validator_1.query)('page').optional().isInt({ min: 1 }), (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }), validator_middleware_1.validate, user_controller_1.userController.getAll);
router.post('/', (0, rbac_middleware_1.requireRole)(User_entity_1.UserRole.ADMIN), createUserValidation, validator_middleware_1.validate, user_controller_1.userController.create);
router.get('/:id', (0, express_validator_1.param)('id').isUUID(), validator_middleware_1.validate, user_controller_1.userController.getById);
router.patch('/:id', (0, rbac_middleware_1.requireRole)(User_entity_1.UserRole.ADMIN), updateUserValidation, validator_middleware_1.validate, user_controller_1.userController.update);
router.delete('/:id', (0, rbac_middleware_1.requireRole)(User_entity_1.UserRole.ADMIN), (0, express_validator_1.param)('id').isUUID(), validator_middleware_1.validate, user_controller_1.userController.delete);
router.patch('/:id/toggle', (0, rbac_middleware_1.requireRole)(User_entity_1.UserRole.ADMIN), (0, express_validator_1.param)('id').isUUID(), validator_middleware_1.validate, user_controller_1.userController.toggleStatus);
exports.default = router;
