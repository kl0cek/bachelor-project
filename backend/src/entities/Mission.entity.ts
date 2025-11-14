import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './User.entity';
import { CrewMember } from './CrewMember.entity';
import { Activity } from './Activity.entity';

export enum MissionStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('missions')
export class Mission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'date' })
  start_date!: Date;

  @Column({ type: 'date' })
  end_date!: Date;

  @Column({
    type: 'enum',
    enum: MissionStatus,
    default: MissionStatus.PLANNING,
  })
  status!: MissionStatus;

  @Column({ type: 'uuid', nullable: true })
  created_by?: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  @ManyToOne(() => User, (user) => user.created_missions, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'created_by' })
  created_by_user?: User;

  @OneToMany(() => CrewMember, (crew) => crew.mission)
  crew_members!: CrewMember[];

  @OneToMany(() => Activity, (activity) => activity.mission_ref)
  activities!: Activity[];

  getDuration(): number {
    const start = new Date(this.start_date);
    const end = new Date(this.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getMissionDay(date: Date = new Date()): number {
    const start = new Date(this.start_date);
    const diffTime = date.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  }

  isActive(currentDate: Date = new Date()): boolean {
    const start = new Date(this.start_date);
    const end = new Date(this.end_date);
    return currentDate >= start && currentDate <= end && this.status === MissionStatus.ACTIVE;
  }
}
