"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crewController = exports.CrewController = void 0;
const crew_service_1 = require("../services/crew.service");
const response_1 = require("../utils/response");
class CrewController {
    async getByMission(req, res, next) {
        try {
            const { missionId } = req.params;
            const crew = await crew_service_1.crewService.getByMission(missionId);
            res.json((0, response_1.successResponse)(crew));
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const crew = await crew_service_1.crewService.getById(id);
            res.json((0, response_1.successResponse)(crew));
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const userId = req.userId;
            const crew = await crew_service_1.crewService.create(req.body, userId);
            res.status(201).json((0, response_1.successResponse)(crew, 'Crew member added'));
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.userId;
            const crew = await crew_service_1.crewService.update(id, req.body, userId);
            res.json((0, response_1.successResponse)(crew, 'Crew member updated'));
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.userId;
            await crew_service_1.crewService.delete(id, userId);
            res.json((0, response_1.successResponse)(null, 'Crew member removed'));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CrewController = CrewController;
exports.crewController = new CrewController();
