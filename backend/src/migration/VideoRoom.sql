-- Video Rooms Migration
-- Add to your migrations folder or run directly

-- Video Rooms table
CREATE TABLE video_rooms (
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

-- Video Sessions table (tracking who joined when)
CREATE TABLE video_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES video_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    peer_id VARCHAR(100) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    CONSTRAINT unique_active_session UNIQUE (room_id, user_id, left_at)
);

-- Indexes
CREATE INDEX idx_video_rooms_mission ON video_rooms(mission_id);
CREATE INDEX idx_video_rooms_active ON video_rooms(is_active);
CREATE INDEX idx_video_sessions_room ON video_sessions(room_id);
CREATE INDEX idx_video_sessions_user ON video_sessions(user_id);
CREATE INDEX idx_video_sessions_joined ON video_sessions(joined_at);

-- Trigger to calculate session duration
CREATE OR REPLACE FUNCTION calculate_session_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.left_at IS NOT NULL AND NEW.joined_at IS NOT NULL THEN
        NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.left_at - NEW.joined_at))::INTEGER;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_video_session_duration
    BEFORE UPDATE ON video_sessions
    FOR EACH ROW
    EXECUTE FUNCTION calculate_session_duration();

COMMENT ON TABLE video_rooms IS 'Video call rooms for missions';
COMMENT ON TABLE video_sessions IS 'Individual user sessions in video rooms';