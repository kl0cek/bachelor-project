import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import bcrypt from 'bcrypt';
import { Mission } from './Mission.entity';
import { CrewMember } from './CrewMember.entity';
import { RefreshToken } from './RefreshToken.entity';
import { AuditLog } from './AuditLog.entity';

export enum UserRole {
  ADMIN = 'admin',
  OPERATOR = 'operator',
  ASTRONAUT = 'astronaut',
  VIEWER = 'viewer',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  username!: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password_hash!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.VIEWER,
  })
  role!: UserRole;

  @Column({ type: 'varchar', length: 100 })
  full_name!: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  email?: string;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  last_login?: Date;

  // Relations
  @OneToMany(() => Mission, (mission) => mission.created_by_user)
  created_missions!: Mission[];

  @OneToMany(() => CrewMember, (crew) => crew.user)
  crew_assignments!: CrewMember[];

  @OneToMany(() => RefreshToken, (token) => token.user)
  refresh_tokens!: RefreshToken[];

  @OneToMany(() => AuditLog, (log) => log.user)
  audit_logs!: AuditLog[];

  // Virtual field for password (not stored in DB)
  password?: string;

  // Hash password before insert/update
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      this.password_hash = await bcrypt.hash(this.password, rounds);
      delete this.password; // Remove plain password
    }
  }

  // Method to validate password
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password_hash);
  }

  // Method to check permissions
  hasPermission(permission: string): boolean {
    const permissions: Record<UserRole, string[]> = {
      [UserRole.VIEWER]: ['view_schedule', 'view_mission'],
      [UserRole.ASTRONAUT]: [
        'view_schedule',
        'view_mission',
        'update_own_activities',
      ],
      [UserRole.OPERATOR]: [
        'view_schedule',
        'view_mission',
        'create_mission',
        'edit_mission',
        'manage_crew',
        'manage_activities',
      ],
      [UserRole.ADMIN]: ['all'],
    };

    if (this.role === UserRole.ADMIN) {
      return true;
    }

    return permissions[this.role]?.includes(permission) || false;
  }

  // Method to check role
  hasRole(role: UserRole): boolean {
    return this.role === role || this.role === UserRole.ADMIN;
  }

  // Sanitize user data (remove sensitive fields)
  toJSON() {
    const { password_hash, refresh_tokens, ...user } = this as any;
    return user;
  }
}