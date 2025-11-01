"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.missionController = exports.MissionController = void 0;
const mission_service_1 = require("../services/mission.service");
const response_1 = require("../utils/response");
class MissionController {
    async getAll(req, res, next) {
        try {
            const { status, startDate, endDate } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await mission_service_1.missionService.getAll({
                status: status,
                startDate: startDate,
                endDate: endDate,
            }, page, limit);
            res.json((0, response_1.paginatedResponse)(result.missions, page, limit, result.total));
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const mission = await mission_service_1.missionService.getById(id);
            res.json((0, response_1.successResponse)(mission));
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const userId = req.userId;
            const mission = await mission_service_1.missionService.create(req.body, userId);
            res.status(201).json((0, response_1.successResponse)(mission, 'Mission created'));
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.userId;
            const mission = await mission_service_1.missionService.update(id, req.body, userId);
            res.json((0, response_1.successResponse)(mission, 'Mission updated'));
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.userId;
            await mission_service_1.missionService.delete(id, userId);
            res.json((0, response_1.successResponse)(null, 'Mission deleted'));
        }
        catch (error) {
            next(error);
        }
    }
    async getActive(req, res, next) {
        try {
            const missions = await mission_service_1.missionService.getActiveMissions();
            res.json((0, response_1.successResponse)(missions));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MissionController = MissionController;
exports.missionController = new MissionController();
