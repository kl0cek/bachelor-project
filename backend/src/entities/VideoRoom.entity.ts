import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Mission } from './Mission.entity';
import { User } from './User.entity';
import { VideoSession } from './VideoSession.entity';

@Entity('video_rooms')
export class VideoRoom {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  mission_id!: string;

  @ManyToOne(() => Mission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mission_id' })
  mission!: Mission;

  @Column({ type: 'varchar', length: 200 })
  room_name!: string;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ type: 'integer', default: 10 })
  max_participants!: number;

  @Column({ type: 'uuid', nullable: true })
  created_by?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  ended_at?: Date;

  @OneToMany(() => VideoSession, (session) => session.room)
  sessions!: VideoSession[];
}
