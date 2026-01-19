import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
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

  @Column({ type: 'varchar', length: 255 })
  room_name!: string;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ type: 'int', default: 10 })
  max_participants!: number;

  @Column({ type: 'uuid', nullable: true })
  created_by!: string;

  @Column({ type: 'float', default: 0 })
  delay_seconds!: number;

  @Column({ type: 'boolean', default: false })
  delay_enabled!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  ended_at!: Date | null;

  @ManyToOne(() => Mission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mission_id' })
  mission!: Mission;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator!: User;

  @OneToMany(() => VideoSession, (session) => session.room)
  sessions!: VideoSession[];
}
