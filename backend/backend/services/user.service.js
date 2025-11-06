"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const database_1 = require("../config/database");
const User_entity_1 = require("../entities/User.entity");
const errors_1 = require("../utils/errors");
const audit_service_1 = require("./audit.service");
class UserService {
    constructor() {
        this.userRepository = database_1.AppDataSource.getRepository(User_entity_1.User);
    }
    async getAll(page = 1, limit = 20) {
        const [users, total] = await this.userRepository.findAndCount({
            order: { created_at: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { users, total, page, limit };
    }
    async getById(id) {
        const user = await this.userRepository.findOne({
            where: { id },
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        return user;
    }
    async create(data, createdBy) {
        // Check if username or email already exists
        const existing = await this.userRepository.findOne({
            where: [{ username: data.username }, { email: data.email }],
        });
        if (existing) {
            throw new errors_1.ConflictError('Username or email already exists');
        }
        const user = this.userRepository.create({
            ...data,
            password: data.password, // Will be hashed by entity hook
            is_active: data.is_active ?? true,
        });
        const saved = await this.userRepository.save(user);
        await audit_service_1.auditService.log({
            userId: createdBy,
            action: 'create_user',
            resourceType: 'user',
            resourceId: saved.id,
            changes: { ...data, password: '[REDACTED]' },
        });
        return saved;
    }
    async update(id, data, updatedBy) {
        const user = await this.getById(id);
        // Check for conflicts
        if (data.username || data.email) {
            const existing = await this.userRepository
                .createQueryBuilder('user')
                .where('user.id != :id', { id })
                .andWhere('(user.username = :username OR user.email = :email)', {
                username: data.username,
                email: data.email,
            })
                .getOne();
            if (existing) {
                throw new errors_1.ConflictError('Username or email already exists');
            }
        }
        const originalData = { ...user };
        Object.assign(user, {
            ...data,
            ...(data.password && { password: data.password }), // Will be hashed
        });
        const updated = await this.userRepository.save(user);
        await audit_service_1.auditService.log({
            userId: updatedBy,
            action: 'update_user',
            resourceType: 'user',
            resourceId: id,
            changes: {
                before: originalData,
                after: { ...data, password: data.password ? '[REDACTED]' : undefined },
            },
        });
        return updated;
    }
    async delete(id, deletedBy) {
        const user = await this.getById(id);
        // Prevent deleting last admin
        if (user.role === User_entity_1.UserRole.ADMIN) {
            const adminCount = await this.userRepository.count({
                where: { role: User_entity_1.UserRole.ADMIN },
            });
            if (adminCount <= 1) {
                throw new errors_1.BadRequestError('Cannot delete the last admin user');
            }
        }
        await this.userRepository.remove(user);
        await audit_service_1.auditService.log({
            userId: deletedBy,
            action: 'delete_user',
            resourceType: 'user',
            resourceId: id,
            changes: user,
        });
    }
    async toggleStatus(id, updatedBy) {
        const user = await this.getById(id);
        // Prevent deactivating last active admin
        if (user.role === User_entity_1.UserRole.ADMIN && user.is_active) {
            const activeAdminCount = await this.userRepository.count({
                where: { role: User_entity_1.UserRole.ADMIN, is_active: true },
            });
            if (activeAdminCount <= 1) {
                throw new errors_1.BadRequestError('Cannot deactivate the last active admin');
            }
        }
        user.is_active = !user.is_active;
        const updated = await this.userRepository.save(user);
        await audit_service_1.auditService.log({
            userId: updatedBy,
            action: 'toggle_user_status',
            resourceType: 'user',
            resourceId: id,
            changes: { is_active: user.is_active },
        });
        return updated;
    }
}
exports.userService = new UserService();
