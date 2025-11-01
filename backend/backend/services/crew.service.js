"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crewService = void 0;
const database_1 = require("../config/database");
const CrewMember_entity_1 = require("../entities/CrewMember.entity");
const Mission_entity_1 = require("../entities/Mission.entity");
const errors_1 = require("../utils/errors");
const audit_service_1 = require("./audit.service");
class CrewService {
    constructor() {
        this.crewRepository = database_1.AppDataSource.getRepository(CrewMember_entity_1.CrewMember);
        this.missionRepository = database_1.AppDataSource.getRepository(Mission_entity_1.Mission);
    }
    async getByMission(missionId) {
        return await this.crewRepository.find({
            where: { mission_id: missionId },
            relations: ['user'],
            order: { name: 'ASC' },
        });
    }
    async getById(id) {
        const crew = await this.crewRepository.findOne({
            where: { id },
            relations: ['mission', 'user'],
        });
        if (!crew) {
            throw new errors_1.NotFoundError('Crew member not found');
        }
        return crew;
    }
    async create(data, userId) {
        // Verify mission exists
        const mission = await this.missionRepository.findOne({
            where: { id: data.mission_id },
        });
        if (!mission) {
            throw new errors_1.NotFoundError('Mission not found');
        }
        const crew = this.crewRepository.create(data);
        const saved = await this.crewRepository.save(crew);
        await audit_service_1.auditService.log({
            userId,
            action: 'add_crew_member',
            resourceType: 'crew_member',
            resourceId: saved.id,
            changes: data,
        });
        return saved;
    }
    async update(id, data, userId) {
        const crew = await this.getById(id);
        Object.assign(crew, data);
        const updated = await this.crewRepository.save(crew);
        await audit_service_1.auditService.log({
            userId,
            action: 'update_crew_member',
            resourceType: 'crew_member',
            resourceId: id,
            changes: data,
        });
        return updated;
    }
    async delete(id, userId) {
        const crew = await this.getById(id);
        await this.crewRepository.remove(crew);
        await audit_service_1.auditService.log({
            userId,
            action: 'remove_crew_member',
            resourceType: 'crew_member',
            resourceId: id,
            changes: crew,
        });
    }
}
exports.crewService = new CrewService();
