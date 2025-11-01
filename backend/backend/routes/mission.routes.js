"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mission_controller_1 = require("../controllers/mission.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const express_validator_1 = require("express-validator");
const validator_middleware_1 = require("../middleware/validator.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Validation schemas
const createMissionValidation = [
    (0, express_validator_1.body)('name').notEmpty().trim().isLength({ max: 200 }),
    (0, express_validator_1.body)('description').notEmpty().trim(),
    (0, express_validator_1.body)('start_date').isISO8601(),
    (0, express_validator_1.body)('end_date').isISO8601(),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['planning', 'active', 'completed', 'cancelled']),
];
const updateMissionValidation = [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('name').optional().trim().isLength({ max: 200 }),
    (0, express_validator_1.body)('description').optional().trim(),
    (0, express_validator_1.body)('start_date').optional().isISO8601(),
    (0, express_validator_1.body)('end_date').optional().isISO8601(),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['planning', 'active', 'completed', 'cancelled']),
];
// Routes
router.get('/', (0, express_validator_1.query)('page').optional().isInt({ min: 1 }), (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }), validator_middleware_1.validate, mission_controller_1.missionController.getAll);
router.get('/active', mission_controller_1.missionController.getActive);
router.post('/', (0, rbac_middleware_1.requirePermission)('create_mission'), createMissionValidation, validator_middleware_1.validate, mission_controller_1.missionController.create);
router.get('/:id', (0, express_validator_1.param)('id').isUUID(), validator_middleware_1.validate, mission_controller_1.missionController.getById);
router.patch('/:id', (0, rbac_middleware_1.requirePermission)('edit_mission'), updateMissionValidation, validator_middleware_1.validate, mission_controller_1.missionController.update);
router.delete('/:id', (0, rbac_middleware_1.requirePermission)('edit_mission'), (0, express_validator_1.param)('id').isUUID(), validator_middleware_1.validate, mission_controller_1.missionController.delete);
exports.default = router;
