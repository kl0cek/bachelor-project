"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const express_validator_1 = require("express-validator");
const validator_middleware_1 = require("../middleware/validator.middleware");
const router = (0, express_1.Router)();
// Login validation
const loginValidation = [
    (0, express_validator_1.body)('username').notEmpty().trim().isLength({ min: 3 }),
    (0, express_validator_1.body)('password').notEmpty().isLength({ min: 6 }),
];
// Routes
router.post('/login', loginValidation, validator_middleware_1.validate, auth_controller_1.authController.login);
router.post('/logout', auth_middleware_1.authenticate, (0, express_validator_1.body)('refreshToken').notEmpty(), validator_middleware_1.validate, auth_controller_1.authController.logout);
router.post('/refresh', (0, express_validator_1.body)('refreshToken').notEmpty(), validator_middleware_1.validate, auth_controller_1.authController.refresh);
router.get('/me', auth_middleware_1.authenticate, auth_controller_1.authController.getCurrentUser);
exports.default = router;
