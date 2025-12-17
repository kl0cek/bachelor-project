import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { VideoRoom } from './VideoRoom.entity';
import { User } from './User.entity';

@Entity('video_sessions')
export class VideoSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  room_id!: string;

  @ManyToOne(() => VideoRoom, (room) => room.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room!: VideoRoom;

  @Column({ type: 'uuid' })
  user_id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', length: 100 })
  peer_id!: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  joined_at!: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  left_at?: Date;

  @Column({ type: 'integer', nullable: true })
  duration_seconds?: number;
}
