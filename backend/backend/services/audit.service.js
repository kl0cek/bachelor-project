"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditService = void 0;
const database_1 = require("../config/database");
const AuditLog_entity_1 = require("../entities/AuditLog.entity");
class AuditService {
    constructor() {
        this.auditRepository = database_1.AppDataSource.getRepository(AuditLog_entity_1.AuditLog);
    }
    async log(data) {
        try {
            const auditLog = this.auditRepository.create({
                user_id: data.userId,
                action: data.action,
                resource_type: data.resourceType,
                resource_id: data.resourceId,
                changes: data.changes,
                ip_address: data.ipAddress,
                user_agent: data.userAgent,
            });
            await this.auditRepository.save(auditLog);
        }
        catch (error) {
            console.error('Failed to create audit log:', error);
            // Don't throw - audit logging should not break the main flow
        }
    }
    async getUserAuditTrail(userId, limit = 50) {
        return await this.auditRepository.find({
            where: { user_id: userId },
            order: { created_at: 'DESC' },
            take: limit,
        });
    }
    async getResourceAuditTrail(resourceType, resourceId, limit = 50) {
        return await this.auditRepository.find({
            where: { resource_type: resourceType, resource_id: resourceId },
            order: { created_at: 'DESC' },
            take: limit,
            relations: ['user'],
        });
    }
}
exports.auditService = new AuditService();
