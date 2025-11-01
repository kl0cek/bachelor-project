"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityService = void 0;
const typeorm_1 = require("typeorm");
const database_1 = require("../config/database");
const Activity_entity_1 = require("../entities/Activity.entity");
const CrewMember_entity_1 = require("../entities/CrewMember.entity");
const errors_1 = require("../utils/errors");
const audit_service_1 = require("./audit.service");
class ActivityService {
    constructor() {
        this.activityRepository = database_1.AppDataSource.getRepository(Activity_entity_1.Activity);
        this.crewRepository = database_1.AppDataSource.getRepository(CrewMember_entity_1.CrewMember);
    }
    // Get activities for a mission on a specific date
    async getActivitiesByMissionAndDate(missionId, date) {
        return await this.activityRepository.find({
            where: {
                mission_id: missionId,
                date: new Date(date),
            },
            relations: ['crew_member', 'crew_member.user'],
            order: {
                crew_member_id: 'ASC',
                start_hour: 'ASC',
            },
        });
    }
    // Get activities for a crew member on a specific date
    async getActivitiesByCrewAndDate(crewMemberId, date) {
        return await this.activityRepository.find({
            where: {
                crew_member_id: crewMemberId,
                date: new Date(date),
            },
            order: {
                start_hour: 'ASC',
            },
        });
    }
    // Get activities for a date range
    async getActivitiesByDateRange(missionId, startDate, endDate) {
        return await this.activityRepository.find({
            where: {
                mission_id: missionId,
                date: (0, typeorm_1.Between)(new Date(startDate), new Date(endDate)),
            },
            relations: ['crew_member'],
            order: {
                date: 'ASC',
                crew_member_id: 'ASC',
                start_hour: 'ASC',
            },
        });
    }
    // Create new activity
    async createActivity(data, userId) {
        // Verify crew member exists
        const crewMember = await this.crewRepository.findOne({
            where: { id: data.crew_member_id },
            relations: ['mission'],
        });
        if (!crewMember) {
            throw new errors_1.NotFoundError('Crew member not found');
        }
        // Verify crew member belongs to the mission
        if (crewMember.mission_id !== data.mission_id) {
            throw new errors_1.BadRequestError('Crew member does not belong to this mission');
        }
        // Validate time constraints
        if (data.start_hour < 0 || data.start_hour >= 24) {
            throw new errors_1.BadRequestError('Start hour must be between 0 and 24');
        }
        if (data.duration <= 0 || data.start_hour + data.duration > 24) {
            throw new errors_1.BadRequestError('Invalid activity duration');
        }
        // Check for conflicts
        const hasConflict = await this.checkTimeConflict(data.crew_member_id, data.date, data.start_hour, data.duration);
        if (hasConflict) {
            throw new errors_1.ConflictError('Activity conflicts with existing schedule');
        }
        // Create activity
        const activity = this.activityRepository.create({
            ...data,
            date: new Date(data.date),
            created_by: userId,
        });
        const saved = await this.activityRepository.save(activity);
        // Log audit
        await audit_service_1.auditService.log({
            userId,
            action: 'create_activity',
            resourceType: 'activity',
            resourceId: saved.id,
            changes: data,
        });
        return saved;
    }
    // Update activity
    async updateActivity(id, data, userId) {
        const activity = await this.activityRepository.findOne({
            where: { id },
        });
        if (!activity) {
            throw new errors_1.NotFoundError('Activity not found');
        }
        const originalData = { ...activity };
        // Validate new time if changed
        if (data.start_hour !== undefined || data.duration !== undefined) {
            const newStartHour = data.start_hour ?? activity.start_hour;
            const newDuration = data.duration ?? activity.duration;
            if (newStartHour < 0 || newStartHour >= 24) {
                throw new errors_1.BadRequestError('Start hour must be between 0 and 24');
            }
            if (newDuration <= 0 || newStartHour + newDuration > 24) {
                throw new errors_1.BadRequestError('Invalid activity duration');
            }
            // Check for conflicts (excluding current activity)
            const date = data.date ? new Date(data.date) : activity.date;
            const hasConflict = await this.checkTimeConflict(activity.crew_member_id, date.toISOString().split('T')[0], newStartHour, newDuration, id);
            if (hasConflict) {
                throw new errors_1.ConflictError('Updated time conflicts with existing schedule');
            }
        }
        // Update fields
        Object.assign(activity, {
            ...data,
            ...(data.date && { date: new Date(data.date) }),
        });
        const updated = await this.activityRepository.save(activity);
        // Log audit
        await audit_service_1.auditService.log({
            userId,
            action: 'update_activity',
            resourceType: 'activity',
            resourceId: id,
            changes: { before: originalData, after: data },
        });
        return updated;
    }
    // Delete activity
    async deleteActivity(id, userId) {
        const activity = await this.activityRepository.findOne({
            where: { id },
        });
        if (!activity) {
            throw new errors_1.NotFoundError('Activity not found');
        }
        await this.activityRepository.remove(activity);
        // Log audit
        await audit_service_1.auditService.log({
            userId,
            action: 'delete_activity',
            resourceType: 'activity',
            resourceId: id,
            changes: activity,
        });
    }
    // Get activity by ID
    async getActivityById(id) {
        const activity = await this.activityRepository.findOne({
            where: { id },
            relations: ['crew_member', 'mission_ref', 'created_by_user'],
        });
        if (!activity) {
            throw new errors_1.NotFoundError('Activity not found');
        }
        return activity;
    }
    // Check for time conflicts
    async checkTimeConflict(crewMemberId, date, startHour, duration, excludeActivityId) {
        const endHour = startHour + duration;
        const query = this.activityRepository
            .createQueryBuilder('activity')
            .where('activity.crew_member_id = :crewMemberId', { crewMemberId })
            .andWhere('activity.date = :date', { date: new Date(date) })
            .andWhere('(activity.start_hour < :endHour AND (activity.start_hour + activity.duration) > :startHour)', { startHour, endHour });
        if (excludeActivityId) {
            query.andWhere('activity.id != :excludeActivityId', { excludeActivityId });
        }
        const conflictCount = await query.getCount();
        return conflictCount > 0;
    }
    // Get available time slots
    async getAvailableTimeSlots(crewMemberId, date, duration, minHour = 6, maxHour = 22) {
        const activities = await this.getActivitiesByCrewAndDate(crewMemberId, date);
        const slots = [];
        let currentHour = minHour;
        // Sort activities by start hour
        const sortedActivities = activities.sort((a, b) => a.start_hour - b.start_hour);
        for (const activity of sortedActivities) {
            const activityStart = activity.start_hour;
            // Check if there's a gap before this activity
            if (currentHour + duration <= activityStart) {
                slots.push({
                    start: currentHour,
                    end: activityStart,
                });
            }
            currentHour = Math.max(currentHour, activity.start_hour + activity.duration);
        }
        // Check for slot after last activity
        if (currentHour + duration <= maxHour) {
            slots.push({
                start: currentHour,
                end: maxHour,
            });
        }
        return slots;
    }
    // Apply filters to activities
    filterActivities(activities, filters) {
        return activities.filter((activity) => {
            if (filters.type && activity.type !== filters.type)
                return false;
            if (filters.priority && activity.priority !== filters.priority)
                return false;
            if (filters.mission && activity.mission !== filters.mission)
                return false;
            if (filters.startHour !== undefined &&
                activity.start_hour < filters.startHour)
                return false;
            if (filters.endHour !== undefined &&
                activity.start_hour + activity.duration > filters.endHour)
                return false;
            if (filters.equipment &&
                activity.equipment &&
                !activity.equipment.some((eq) => eq.includes(filters.equipment)))
                return false;
            return true;
        });
    }
    // Get activity statistics
    async getActivityStats(missionId, startDate, endDate) {
        const activities = await this.getActivitiesByDateRange(missionId, startDate, endDate);
        const stats = {
            total: activities.length,
            byType: {},
            byPriority: {},
            totalHours: 0,
            averagePerDay: 0,
        };
        activities.forEach((activity) => {
            // Count by type
            stats.byType[activity.type] =
                (stats.byType[activity.type] || 0) + 1;
            // Count by priority
            if (activity.priority) {
                stats.byPriority[activity.priority] =
                    (stats.byPriority[activity.priority] || 0) + 1;
            }
            // Sum hours
            stats.totalHours += activity.duration;
        });
        // Calculate average per day
        const daysDiff = (new Date(endDate).getTime() - new Date(startDate).getTime()) /
            (1000 * 60 * 60 * 24);
        stats.averagePerDay = stats.total / Math.max(daysDiff, 1);
        return stats;
    }
}
exports.activityService = new ActivityService();
