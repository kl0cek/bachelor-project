"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const response_1 = require("../utils/response");
class UserController {
    async getAll(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await user_service_1.userService.getAll(page, limit);
            res.json((0, response_1.paginatedResponse)(result.users, page, limit, result.total));
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const user = await user_service_1.userService.getById(id);
            res.json((0, response_1.successResponse)(user));
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const userId = req.userId;
            const user = await user_service_1.userService.create(req.body, userId);
            res.status(201).json((0, response_1.successResponse)(user, 'User created'));
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.userId;
            const user = await user_service_1.userService.update(id, req.body, userId);
            res.json((0, response_1.successResponse)(user, 'User updated'));
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.userId;
            await user_service_1.userService.delete(id, userId);
            res.json((0, response_1.successResponse)(null, 'User deleted'));
        }
        catch (error) {
            next(error);
        }
    }
    async toggleStatus(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.userId;
            const user = await user_service_1.userService.toggleStatus(id, userId);
            res.json((0, response_1.successResponse)(user, 'User status updated'));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
exports.userController = new UserController();
