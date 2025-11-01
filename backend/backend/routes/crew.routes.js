"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crew_controller_1 = require("../controllers/crew.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const express_validator_1 = require("express-validator");
const validator_middleware_1 = require("../middleware/validator.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Validation schemas
const createCrewValidation = [
    (0, express_validator_1.body)('mission_id').isUUID(),
    (0, express_validator_1.body)('name').notEmpty().trim().isLength({ max: 100 }),
    (0, express_validator_1.body)('role').optional().isString(),
    (0, express_validator_1.body)('email').optional().isEmail(),
    (0, express_validator_1.body)('user_id').optional().isUUID(),
];
// Routes
router.get('/missions/:missionId/crew', (0, express_validator_1.param)('missionId').isUUID(), validator_middleware_1.validate, crew_controller_1.crewController.getByMission);
router.post('/missions/:missionId/crew', (0, rbac_middleware_1.requirePermission)('manage_crew'), (0, express_validator_1.param)('missionId').isUUID(), createCrewValidation, validator_middleware_1.validate, crew_controller_1.crewController.create);
router.get('/:id', (0, express_validator_1.param)('id').isUUID(), validator_middleware_1.validate, crew_controller_1.crewController.getById);
router.patch('/:id', (0, rbac_middleware_1.requirePermission)('manage_crew'), (0, express_validator_1.param)('id').isUUID(), validator_middleware_1.validate, crew_controller_1.crewController.update);
router.delete('/:id', (0, rbac_middleware_1.requirePermission)('manage_crew'), (0, express_validator_1.param)('id').isUUID(), validator_middleware_1.validate, crew_controller_1.crewController.delete);
exports.default = router;
