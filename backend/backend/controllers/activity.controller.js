"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityController = exports.ActivityController = void 0;
const activity_service_1 = require("../services/activity.service");
const response_1 = require("../utils/response");
const errors_1 = require("../utils/errors");
class ActivityController {
    async getByMissionAndDate(req, res, next) {
        try {
            const { missionId } = req.params;
            const { date } = req.query;
            if (!date) {
                throw new errors_1.BadRequestError('Date parameter is required');
            }
            const activities = await activity_service_1.activityService.getActivitiesByMissionAndDate(missionId, date);
            res.json((0, response_1.successResponse)(activities));
        }
        catch (error) {
            next(error);
        }
    }
    async getByCrewAndDate(req, res, next) {
        try {
            const { crewId } = req.params;
            const { date } = req.query;
            if (!date) {
                throw new errors_1.BadRequestError('Date parameter is required');
            }
            const activities = await activity_service_1.activityService.getActivitiesByCrewAndDate(crewId, date);
            res.json((0, response_1.successResponse)(activities));
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const userId = req.userId;
            const activity = await activity_service_1.activityService.createActivity(req.body, userId);
            res.status(201).json((0, response_1.successResponse)(activity, 'Activity created'));
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.userId;
            const activity = await activity_service_1.activityService.updateActivity(id, req.body, userId);
            res.json((0, response_1.successResponse)(activity, 'Activity updated'));
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.userId;
            await activity_service_1.activityService.deleteActivity(id, userId);
            res.json((0, response_1.successResponse)(null, 'Activity deleted'));
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const activity = await activity_service_1.activityService.getActivityById(id);
            res.json((0, response_1.successResponse)(activity));
        }
        catch (error) {
            next(error);
        }
    }
    async getAvailableSlots(req, res, next) {
        try {
            const { crewId } = req.params;
            const { date, duration } = req.query;
            if (!date || !duration) {
                throw new errors_1.BadRequestError('Date and duration are required');
            }
            const slots = await activity_service_1.activityService.getAvailableTimeSlots(crewId, date, parseFloat(duration));
            res.json((0, response_1.successResponse)(slots));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ActivityController = ActivityController;
exports.activityController = new ActivityController();
