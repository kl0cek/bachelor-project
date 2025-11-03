import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Mission } from './Mission.entity';
import { CrewMember } from './CrewMember.entity';
import { User } from './User.entity';

export enum ActivityType {
  EXERCISE = 'exercise',
  MEAL = 'meal',
  SLEEP = 'sleep',
  WORK = 'work',
  EVA = 'eva',
  OPTIONAL = 'optional',
}

export enum Priority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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

  @Column({
    type: 'enum',
    enum: ActivityType,
  })
  type!: ActivityType;

  @Column({
    type: 'enum',
    enum: Priority,
    nullable: true,
  })
  priority?: Priority;

  @Column({ type: 'varchar', length: 200, nullable: true })
  mission?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', array: true, nullable: true })
  equipment?: string[];

  @Column({ type: 'uuid', nullable: true })
  created_by?: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  @ManyToOne(() => CrewMember, (crew) => crew.activities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'crew_member_id' })
  crew_member!: CrewMember;

  @ManyToOne(() => Mission, (mission) => mission.activities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'mission_id' })
  mission_ref!: Mission;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  created_by_user?: User;

  getEndHour(): number {
    return this.start_hour + this.duration;
  }

  hasConflict(other: Activity): boolean {
    if (this.crew_member_id !== other.crew_member_id) return false;
    if (this.date.toString() !== other.date.toString()) return false;

    const thisEnd = this.getEndHour();
    const otherEnd = other.getEndHour();

    return this.start_hour < otherEnd && thisEnd > other.start_hour;
  }
}
