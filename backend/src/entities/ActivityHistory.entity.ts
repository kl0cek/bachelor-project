import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { ActivityType } from './Activity.entity';
import { Priority } from './Activity.entity';
import { User } from './User.entity';

export enum ChangeType {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
}

@Entity('activity_history')
export class ActivityHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  activity_id!: string;

  @Column({ type: 'uuid' })
  crew_member_id!: string;

  @Column({ type: 'uuid' })
  mission_id!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'date' })
  date!: Date;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  start_hour!: number;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  duration!: number;

  @Column({ type: 'enum', enum: ActivityType })
  type!: ActivityType;

  @Column({ type: 'enum', enum: Priority, nullable: true })
  priority?: Priority;

  @Column({ type: 'varchar', length: 200, nullable: true })
  mission?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', array: true, nullable: true })
  equipment?: string[];

  @Column({ type: 'uuid', nullable: true })
  changed_by?: string;

  @Column({ type: 'enum', enum: ChangeType })
  change_type!: ChangeType;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'changed_by' })
  changed_by_user?: User;
}
