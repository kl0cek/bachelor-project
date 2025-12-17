import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Mission } from './Mission.entity';
import { CrewMember } from './CrewMember.entity';
import { User } from './User.entity';
import { ActivityComment } from './ActivityComment.entity';

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

export enum RecurrenceType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  CUSTOM = 'custom',
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

  @Column({ type: 'varchar', length: 20 })
  type!: ActivityType;

  @Column({ type: 'varchar', length: 20, nullable: true })
  priority?: Priority;

  @Column({ type: 'varchar', length: 200, nullable: true })
  mission?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', array: true, nullable: true })
  equipment?: string[];

  @Column({ type: 'uuid', nullable: true })
  created_by?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  pdf_url?: string;

  @Column({ type: 'boolean', default: false })
  is_recurring!: boolean;

  @Column({ type: 'uuid', nullable: true })
  parent_activity_id?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  recurrence_type?: RecurrenceType;

  @Column({ type: 'integer', nullable: true })
  recurrence_interval?: number;

  @Column({ type: 'integer', array: true, nullable: true })
  recurrence_days_of_week?: number[];

  @Column({ type: 'date', nullable: true })
  recurrence_end_date?: Date;

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

  @ManyToOne(() => Activity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_activity_id' })
  parent_activity?: Activity;

  @OneToMany(() => ActivityComment, (comment) => comment.activity)
  comments!: ActivityComment[];

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

  isRecurringInstance(): boolean {
    return !!this.parent_activity_id;
  }

  isRecurringParent(): boolean {
    return this.is_recurring && !this.parent_activity_id;
  }
}
