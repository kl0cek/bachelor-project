"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const activity_controller_1 = require("../controllers/activity.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const express_validator_1 = require("express-validator");
const validator_middleware_1 = require("../middleware/validator.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Validation schemas
const createActivityValidation = [
    (0, express_validator_1.body)('crew_member_id').isUUID(),
    (0, express_validator_1.body)('mission_id').isUUID(),
    (0, express_validator_1.body)('name').notEmpty().trim().isLength({ max: 200 }),
    (0, express_validator_1.body)('date').isISO8601(),
    (0, express_validator_1.body)('start_hour').isFloat({ min: 0, max: 24 }),
    (0, express_validator_1.body)('duration').isFloat({ min: 0.1, max: 24 }),
    (0, express_validator_1.body)('type').isIn(['exercise', 'meal', 'sleep', 'work', 'eva', 'optional']),
    (0, express_validator_1.body)('priority').optional().isIn(['high', 'medium', 'low']),
    (0, express_validator_1.body)('mission').optional().isString(),
    (0, express_validator_1.body)('description').optional().isString(),
    (0, express_validator_1.body)('equipment').optional().isArray(),
];
const updateActivityValidation = [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('name').optional().trim().isLength({ max: 200 }),
    (0, express_validator_1.body)('date').optional().isISO8601(),
    (0, express_validator_1.body)('start_hour').optional().isFloat({ min: 0, max: 24 }),
    (0, express_validator_1.body)('duration').optional().isFloat({ min: 0.1, max: 24 }),
    (0, express_validator_1.body)('type')
        .optional()
        .isIn(['exercise', 'meal', 'sleep', 'work', 'eva', 'optional']),
    (0, express_validator_1.body)('priority').optional().isIn(['high', 'medium', 'low']),
    (0, express_validator_1.body)('mission').optional().isString(),
    (0, express_validator_1.body)('description').optional().isString(),
    (0, express_validator_1.body)('equipment').optional().isArray(),
];
// Routes
router.post('/missions/:missionId/activities', (0, rbac_middleware_1.requirePermission)('manage_activities'), createActivityValidation, validator_middleware_1.validate, activity_controller_1.activityController.create);
router.get('/missions/:missionId/activities', (0, express_validator_1.query)('date').notEmpty().isISO8601(), validator_middleware_1.validate, activity_controller_1.activityController.getByMissionAndDate);
router.get('/crew/:crewId/activities', (0, express_validator_1.query)('date').notEmpty().isISO8601(), validator_middleware_1.validate, activity_controller_1.activityController.getByCrewAndDate);
router.get('/crew/:crewId/available-slots', (0, express_validator_1.query)('date').notEmpty().isISO8601(), (0, express_validator_1.query)('duration').notEmpty().isFloat(), validator_middleware_1.validate, activity_controller_1.activityController.getAvailableSlots);
router.get('/:id', (0, express_validator_1.param)('id').isUUID(), validator_middleware_1.validate, activity_controller_1.activityController.getById);
router.patch('/:id', (0, rbac_middleware_1.requirePermission)('manage_activities'), updateActivityValidation, validator_middleware_1.validate, activity_controller_1.activityController.update);
router.delete('/:id', (0, rbac_middleware_1.requirePermission)('manage_activities'), (0, express_validator_1.param)('id').isUUID(), validator_middleware_1.validate, activity_controller_1.activityController.delete);
exports.default = router;
