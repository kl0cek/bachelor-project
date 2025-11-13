import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Activity } from './Activity.entity';
import { User } from './User.entity';

@Entity('activity_comments')
export class ActivityComment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  activity_id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({ type: 'text' })
  comment!: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  @ManyToOne(() => Activity, (activity) => activity.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'activity_id' })
  activity!: Activity;

  @ManyToOne(() => User, (user) => user.activity_comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  toJSON() {
    return {
      id: this.id,
      activity_id: this.activity_id,
      user_id: this.user_id,
      comment: this.comment,
      created_at: this.created_at,
      updated_at: this.updated_at,
      ...(this.user && {
        username: this.user.username,
        full_name: this.user.full_name,
        role: this.user.role,
      }),
    };
  }
}
