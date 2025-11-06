import { AppDataSource } from '../config/database';
import { AuditLog } from '../entities/AuditLog.entity';

interface AuditLogData {
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

class AuditService {
  private auditRepository = AppDataSource.getRepository(AuditLog);

  async log(data: AuditLogData): Promise<void> {
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
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw - audit logging should not break the main flow
    }
  }

  async getUserAuditTrail(userId: string, limit: number = 50): Promise<AuditLog[]> {
    return await this.auditRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async getResourceAuditTrail(
    resourceType: string,
    resourceId: string,
    limit: number = 50
  ): Promise<AuditLog[]> {
    return await this.auditRepository.find({
      where: { resource_type: resourceType, resource_id: resourceId },
      order: { created_at: 'DESC' },
      take: limit,
      relations: ['user'],
    });
  }
}

export const auditService = new AuditService();
