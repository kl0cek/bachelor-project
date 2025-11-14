import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User.entity';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';
import { auditService } from './audit.service';
import bcrypt from 'bcrypt';

export interface CreateUserDto {
  username: string;
  password: string;
  full_name: string;
  email?: string;
  role: UserRole;
  is_active?: boolean;
}

export interface UpdateUserDto {
  username?: string;
  password?: string;
  full_name?: string;
  email?: string;
  role?: UserRole;
  is_active?: boolean;
}

class UserService {
  private userRepository = AppDataSource.getRepository(User);

  async getAll(page: number = 1, limit: number = 20) {
    const [users, total] = await this.userRepository.findAndCount({
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { users, total, page, limit };
  }

  async getById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async create(data: CreateUserDto, createdBy: string): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: [{ username: data.username }, { email: data.email }],
    });

    if (existing) {
      throw new ConflictError('Username or email already exists');
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = this.userRepository.create({
      username: data.username,
      password_hash: hashedPassword,
      full_name: data.full_name,
      email: data.email,
      role: data.role,
      is_active: data.is_active ?? true,
    });

    const saved = await this.userRepository.save(user);

    await auditService.log({
      userId: createdBy,
      action: 'create_user',
      resourceType: 'user',
      resourceId: saved.id,
      changes: { ...data, password: '[REDACTED]' },
    });

    return saved;
  }

  async update(id: string, data: UpdateUserDto, updatedBy: string): Promise<User> {
    const user = await this.getById(id);

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
        throw new ConflictError('Username or email already exists');
      }
    }

    const originalData = { ...user };

    // Hash password if it's being updated
    if (data.password) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      Object.assign(user, {
        username: data.username,
        password_hash: hashedPassword,
        full_name: data.full_name,
        email: data.email,
        role: data.role,
        is_active: data.is_active,
      });
    } else {
      Object.assign(user, {
        username: data.username,
        full_name: data.full_name,
        email: data.email,
        role: data.role,
        is_active: data.is_active,
      });
    }

    const updated = await this.userRepository.save(user);

    await auditService.log({
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

  async delete(id: string, deletedBy: string): Promise<void> {
    const user = await this.getById(id);

    if (user.role === UserRole.ADMIN) {
      const adminCount = await this.userRepository.count({
        where: { role: UserRole.ADMIN },
      });

      if (adminCount <= 1) {
        throw new BadRequestError('Cannot delete the last admin user');
      }
    }

    await this.userRepository.remove(user);

    await auditService.log({
      userId: deletedBy,
      action: 'delete_user',
      resourceType: 'user',
      resourceId: id,
      changes: user,
    });
  }

  async toggleStatus(id: string, updatedBy: string): Promise<User> {
    const user = await this.getById(id);

    if (user.role === UserRole.ADMIN && user.is_active) {
      const activeAdminCount = await this.userRepository.count({
        where: { role: UserRole.ADMIN, is_active: true },
      });

      if (activeAdminCount <= 1) {
        throw new BadRequestError('Cannot deactivate the last active admin');
      }
    }

    user.is_active = !user.is_active;
    const updated = await this.userRepository.save(user);

    await auditService.log({
      userId: updatedBy,
      action: 'toggle_user_status',
      resourceType: 'user',
      resourceId: id,
      changes: { is_active: user.is_active },
    });

    return updated;
  }
}

export const userService = new UserService();
