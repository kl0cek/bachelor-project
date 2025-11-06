"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.missionService = void 0;
const database_1 = require("../config/database");
const Mission_entity_1 = require("../entities/Mission.entity");
const errors_1 = require("../utils/errors");
const audit_service_1 = require("./audit.service");
class MissionService {
    constructor() {
        this.missionRepository = database_1.AppDataSource.getRepository(Mission_entity_1.Mission);
    }
    async getAll(filters, page = 1, limit = 20) {
        const query = this.missionRepository
            .createQueryBuilder('mission')
            .leftJoinAndSelect('mission.created_by_user', 'user')
            .leftJoinAndSelect('mission.crew_members', 'crew');
        if (filters?.status) {
            query.andWhere('mission.status = :status', { status: filters.status });
        }
        if (filters?.startDate) {
            query.andWhere('mission.start_date >= :startDate', {
                startDate: filters.startDate,
            });
        }
        if (filters?.endDate) {
            query.andWhere('mission.end_date <= :endDate', {
                endDate: filters.endDate,
            });
        }
        const [missions, total] = await query
            .orderBy('mission.created_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return { missions, total, page, limit };
    }
    async getById(id) {
        const mission = await this.missionRepository.findOne({
            where: { id },
            relations: ['created_by_user', 'crew_members', 'crew_members.user'],
        });
        if (!mission) {
            throw new errors_1.NotFoundError('Mission not found');
        }
        return mission;
    }
    async create(data, userId) {
        // Validate dates
        const startDate = new Date(data.start_date);
        const endDate = new Date(data.end_date);
        if (endDate < startDate) {
            throw new errors_1.BadRequestError('End date must be after start date');
        }
        const mission = this.missionRepository.create({
            ...data,
            start_date: startDate,
            end_date: endDate,
            created_by: userId,
        });
        const saved = await this.missionRepository.save(mission);
        await audit_service_1.auditService.log({
            userId,
            action: 'create_mission',
            resourceType: 'mission',
            resourceId: saved.id,
            changes: data,
        });
        return saved;
    }
    async update(id, data, userId) {
        const mission = await this.getById(id);
        // Validate dates if provided
        if (data.start_date || data.end_date) {
            const startDate = data.start_date
                ? new Date(data.start_date)
                : mission.start_date;
            const endDate = data.end_date
                ? new Date(data.end_date)
                : mission.end_date;
            if (endDate < startDate) {
                throw new errors_1.BadRequestError('End date must be after start date');
            }
        }
        const originalData = { ...mission };
        Object.assign(mission, {
            ...data,
            ...(data.start_date && { start_date: new Date(data.start_date) }),
            ...(data.end_date && { end_date: new Date(data.end_date) }),
        });
        const updated = await this.missionRepository.save(mission);
        await audit_service_1.auditService.log({
            userId,
            action: 'update_mission',
            resourceType: 'mission',
            resourceId: id,
            changes: { before: originalData, after: data },
        });
        return updated;
    }
    async delete(id, userId) {
        const mission = await this.getById(id);
        await this.missionRepository.remove(mission);
        await audit_service_1.auditService.log({
            userId,
            action: 'delete_mission',
            resourceType: 'mission',
            resourceId: id,
            changes: mission,
        });
    }
    async getActiveMissions() {
        return await this.missionRepository.find({
            where: { status: Mission_entity_1.MissionStatus.ACTIVE },
            relations: ['crew_members'],
            order: { start_date: 'ASC' },
        });
    }
}
exports.missionService = new MissionService();
