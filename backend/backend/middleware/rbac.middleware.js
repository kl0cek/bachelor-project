"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = exports.requireRole = void 0;
const User_entity_1 = require("../entities/User.entity");
const errors_1 = require("../utils/errors");
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errors_1.UnauthorizedError('Not authenticated'));
        }
        if (req.user.role === User_entity_1.UserRole.ADMIN) {
            return next(); // Admin can access everything
        }
        if (!roles.includes(req.user.role)) {
            return next(new errors_1.ForbiddenError('Insufficient permissions to access this resource'));
        }
        next();
    };
};
exports.requireRole = requireRole;
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errors_1.UnauthorizedError('Not authenticated'));
        }
        if (!req.user.hasPermission(permission)) {
            return next(new errors_1.ForbiddenError(`Missing required permission: ${permission}`));
        }
        next();
    };
};
exports.requirePermission = requirePermission;
