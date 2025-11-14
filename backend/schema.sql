-- Mission Control Platform Database Schema
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'operator', 'astronaut', 'viewer')),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Missions table
CREATE TABLE missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- Crew Members table
CREATE TABLE crew_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100),
    email VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(mission_id, name)
);

-- Activities table
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crew_member_id UUID NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    date DATE NOT NULL,
    start_hour DECIMAL(4,2) NOT NULL CHECK (start_hour >= 0 AND start_hour < 24),
    duration DECIMAL(4,2) NOT NULL CHECK (duration > 0 AND duration <= 24),
    type VARCHAR(20) NOT NULL CHECK (type IN ('exercise', 'meal', 'sleep', 'work', 'eva', 'optional')),
    priority VARCHAR(20) CHECK (priority IN ('high', 'medium', 'low')),
    mission VARCHAR(200),
    description TEXT,
    equipment TEXT[],
    pdf_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT valid_time_range CHECK (start_hour + duration <= 24)
);

CREATE TABLE activity_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Refresh Tokens table (for JWT)
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT
);

-- Audit Logs table (archiwizacja)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activity History (archiwizacja zmian)
CREATE TABLE activity_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL,
    crew_member_id UUID NOT NULL,
    mission_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    date DATE NOT NULL,
    start_hour DECIMAL(4,2) NOT NULL,
    duration DECIMAL(4,2) NOT NULL,
    type VARCHAR(20) NOT NULL,
    priority VARCHAR(20),
    mission VARCHAR(200),
    description TEXT,
    equipment TEXT[],
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('created', 'updated', 'deleted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_missions_dates ON missions(start_date, end_date);
CREATE INDEX idx_missions_created_by ON missions(created_by);

CREATE INDEX idx_crew_mission ON crew_members(mission_id);
CREATE INDEX idx_crew_user ON crew_members(user_id);

CREATE INDEX idx_activities_crew ON activities(crew_member_id);
CREATE INDEX idx_activities_mission ON activities(mission_id);
CREATE INDEX idx_activities_date ON activities(date);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_mission_date ON activities(mission_id, date);
CREATE INDEX idx_activities_pdf_url ON activities(pdf_url);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

CREATE INDEX idx_activity_history_activity ON activity_history(activity_id);
CREATE INDEX idx_activity_history_date ON activity_history(date);

CREATE INDEX idx_activity_comments_activity ON activity_comments(activity_id);
CREATE INDEX idx_activity_comments_user ON activity_comments(user_id);
CREATE INDEX idx_activity_comments_created ON activity_comments(created_at DESC);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON missions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crew_members_updated_at BEFORE UPDATE ON crew_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for activity history archiving
CREATE OR REPLACE FUNCTION archive_activity_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO activity_history (
            activity_id, crew_member_id, mission_id, name, date, start_hour,
            duration, type, priority, mission, description, equipment,
            changed_by, change_type
        ) VALUES (
            OLD.id, OLD.crew_member_id, OLD.mission_id, OLD.name, OLD.date,
            OLD.start_hour, OLD.duration, OLD.type, OLD.priority, OLD.mission,
            OLD.description, OLD.equipment, OLD.created_by, 'deleted'
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO activity_history (
            activity_id, crew_member_id, mission_id, name, date, start_hour,
            duration, type, priority, mission, description, equipment,
            changed_by, change_type
        ) VALUES (
            NEW.id, NEW.crew_member_id, NEW.mission_id, NEW.name, NEW.date,
            NEW.start_hour, NEW.duration, NEW.type, NEW.priority, NEW.mission,
            NEW.description, NEW.equipment, NEW.created_by, 'updated'
        );
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO activity_history (
            activity_id, crew_member_id, mission_id, name, date, start_hour,
            duration, type, priority, mission, description, equipment,
            changed_by, change_type
        ) VALUES (
            NEW.id, NEW.crew_member_id, NEW.mission_id, NEW.name, NEW.date,
            NEW.start_hour, NEW.duration, NEW.type, NEW.priority, NEW.mission,
            NEW.description, NEW.equipment, NEW.created_by, 'created'
        );
        RETURN NEW;
    END IF;
END;
$$ language 'plpgsql';

CREATE TRIGGER archive_activities_trigger
    AFTER INSERT OR UPDATE OR DELETE ON activities
    FOR EACH ROW EXECUTE FUNCTION archive_activity_changes();

CREATE TRIGGER update_activity_comments_updated_at 
    BEFORE UPDATE ON activity_comments
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Views for common queries
CREATE VIEW active_missions_view AS
SELECT 
    m.*,
    u.full_name as created_by_name,
    COUNT(DISTINCT cm.id) as crew_count,
    COUNT(a.id) as total_activities
FROM missions m
LEFT JOIN users u ON m.created_by = u.id
LEFT JOIN crew_members cm ON m.id = cm.mission_id
LEFT JOIN activities a ON m.id = a.mission_id
WHERE m.status = 'active'
GROUP BY m.id, u.full_name;

CREATE VIEW crew_with_activities_view AS
SELECT 
    cm.*,
    m.name as mission_name,
    m.status as mission_status,
    COUNT(a.id) as activity_count
FROM crew_members cm
LEFT JOIN missions m ON cm.mission_id = m.id
LEFT JOIN activities a ON cm.id = a.crew_member_id
GROUP BY cm.id, m.name, m.status;

CREATE VIEW activity_comments_with_users AS
SELECT 
    ac.id,
    ac.activity_id,
    ac.comment,
    ac.created_at,
    ac.updated_at,
    u.id as user_id,
    u.username,
    u.full_name,
    u.role
FROM activity_comments ac
JOIN users u ON ac.user_id = u.id
ORDER BY ac.created_at ASC;

-- Comments for documentation
COMMENT ON TABLE users IS 'System users with role-based access control';
COMMENT ON TABLE missions IS 'Space missions with crew and schedules';
COMMENT ON TABLE crew_members IS 'Mission crew assignments';
COMMENT ON TABLE activities IS 'Scheduled activities for crew members';
COMMENT ON TABLE refresh_tokens IS 'JWT refresh tokens for authentication';
COMMENT ON TABLE audit_logs IS 'System audit trail for all operations';
COMMENT ON TABLE activity_history IS 'Historical archive of all activity changes';
COMMENT ON TABLE activity_comments IS 'Comments added by astronauts to activities';
