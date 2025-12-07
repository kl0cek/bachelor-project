import { MigrationInterface, QueryRunner } from "typeorm";

export class VideoRooms1765127817114 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // UUID extension (safe)
        await queryRunner.query(`
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        `);

        // Table: video_rooms
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS video_rooms (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
                room_name VARCHAR(200) NOT NULL,
                is_active BOOLEAN DEFAULT true,
                max_participants INTEGER DEFAULT 10,
                created_by UUID REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                ended_at TIMESTAMP WITH TIME ZONE,
                CONSTRAINT unique_active_room_per_mission UNIQUE (mission_id, is_active)
            );
        `);

        // Table: video_sessions
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS video_sessions (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                room_id UUID NOT NULL REFERENCES video_rooms(id) ON DELETE CASCADE,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                peer_id VARCHAR(100) NOT NULL,
                joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                left_at TIMESTAMP WITH TIME ZONE,
                duration_seconds INTEGER,
                CONSTRAINT unique_active_session UNIQUE (room_id, user_id, left_at)
            );
        `);

        // Indexes (no CONCURRENTLY because migrations run in transaction)
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_video_rooms_mission ON video_rooms(mission_id);
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_video_rooms_active ON video_rooms(is_active);
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_video_sessions_room ON video_sessions(room_id);
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_video_sessions_user ON video_sessions(user_id);
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_video_sessions_joined ON video_sessions(joined_at);
        `);

        // Function & Trigger
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION calculate_session_duration()
            RETURNS TRIGGER AS $$
            BEGIN
                IF NEW.left_at IS NOT NULL AND NEW.joined_at IS NOT NULL THEN
                    NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.left_at - NEW.joined_at))::INTEGER;
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

        await queryRunner.query(`
            DROP TRIGGER IF EXISTS update_video_session_duration ON video_sessions;
        `);

        await queryRunner.query(`
            CREATE TRIGGER update_video_session_duration
            BEFORE UPDATE ON video_sessions
            FOR EACH ROW
            EXECUTE FUNCTION calculate_session_duration();
        `);

        // Comments
        await queryRunner.query(`
            COMMENT ON TABLE video_rooms IS 'Video call rooms for missions';
        `);
        await queryRunner.query(`
            COMMENT ON TABLE video_sessions IS 'Individual user sessions in video rooms';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TRIGGER IF EXISTS update_video_session_duration ON video_sessions;`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS calculate_session_duration;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_video_sessions_joined;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_video_sessions_user;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_video_sessions_room;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_video_rooms_active;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_video_rooms_mission;`);
        await queryRunner.query(`DROP TABLE IF EXISTS video_sessions;`);
        await queryRunner.query(`DROP TABLE IF EXISTS video_rooms;`);
    }
}