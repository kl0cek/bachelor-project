-- Seed data for Mission Control Platform
-- Run after schema creation

-- Insert default users (passwords are hashed version of plain text)
-- Password hashing will be done by backend, these are placeholders
INSERT INTO users (id, username, password_hash, role, full_name, email, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin', '$2b$12$placeholder_admin_hash', 'admin', 'System Administrator', 'admin@mission-control.space', true),
('550e8400-e29b-41d4-a716-446655440002', 'operator1', '$2b$12$placeholder_operator_hash', 'operator', 'Mission Operator', 'operator@mission-control.space', true),
('550e8400-e29b-41d4-a716-446655440003', 'astronaut1', '$2b$12$placeholder_astronaut_hash', 'astronaut', 'John Astronaut', 'astronaut@mission-control.space', true),
('550e8400-e29b-41d4-a716-446655440004', 'viewer1', '$2b$12$placeholder_viewer_hash', 'viewer', 'Mission Viewer', 'viewer@mission-control.space', true);

-- Insert missions
INSERT INTO missions (id, name, description, start_date, end_date, status, created_by) VALUES
(
    '660e8400-e29b-41d4-a716-446655440001',
    'ISS Expedition 71',
    'Long-duration spaceflight mission to the International Space Station focusing on scientific research and station maintenance.',
    '2025-10-15',
    '2025-11-07',
    'active',
    '550e8400-e29b-41d4-a716-446655440002'
),
(
    '660e8400-e29b-41d4-a716-446655440002',
    'Mars Analog Simulation',
    'Ground-based analog mission simulating Mars surface operations for psychological and operational research.',
    '2024-11-01',
    '2025-02-01',
    'planning',
    '550e8400-e29b-41d4-a716-446655440002'
),
(
    '660e8400-e29b-41d4-a716-446655440003',
    'Lunar Gateway Simulation',
    'Simulation of lunar orbital operations and surface missions for Artemis program preparation.',
    '2024-08-01',
    '2024-09-30',
    'completed',
    '550e8400-e29b-41d4-a716-446655440002'
),
(
    '660e8400-e29b-41d4-a716-446655440004',
    'Deep Space Habitat Test',
    'Extended isolation mission testing life support systems and crew psychology for deep space exploration.',
    '2025-01-15',
    '2025-07-15',
    'planning',
    '550e8400-e29b-41d4-a716-446655440001'
);

-- Insert crew members for ISS Expedition 71
INSERT INTO crew_members (id, mission_id, user_id, name, role, email) VALUES
(
    '770e8400-e29b-41d4-a716-446655440001',
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440003',
    'FE-1',
    'Flight Engineer',
    'fe1@mission-control.space'
),
(
    '770e8400-e29b-41d4-a716-446655440002',
    '660e8400-e29b-41d4-a716-446655440001',
    NULL,
    'FE-2',
    'Flight Engineer',
    'fe2@mission-control.space'
),
(
    '770e8400-e29b-41d4-a716-446655440004',
    '660e8400-e29b-41d4-a716-446655440001',
    NULL,
    'FE-4',
    'Flight Engineer',
    'fe4@mission-control.space'
),
(
    '770e8400-e29b-41d4-a716-446655440005',
    '660e8400-e29b-41d4-a716-446655440001',
    NULL,
    'FE-5',
    'Flight Engineer',
    'fe5@mission-control.space'
);

-- Insert sample activities for Day 1 (2025-10-15)
-- FE-1 Activities
INSERT INTO activities (crew_member_id, mission_id, name, date, start_hour, duration, type, priority, mission, description, created_by) VALUES
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Sleep', '2025-10-15', 0, 6, 'sleep', 'high', 'Daily Operations', 'Night sleep period', '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Post-sleep', '2025-10-15', 7, 1, 'sleep', 'medium', 'Daily Operations', 'Morning routine and preparation', '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Exercise', '2025-10-15', 11, 1.5, 'exercise', 'high', 'Health & Fitness', 'Cardiovascular training', '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Lunch', '2025-10-15', 12.5, 0.5, 'meal', 'medium', 'Nutrition Program', 'Midday meal', '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Science Work', '2025-10-15', 14, 3, 'work', 'high', 'Research Operations', 'Biology experiments', '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Dinner', '2025-10-15', 18, 1, 'meal', 'medium', 'Nutrition Program', 'Evening meal with crew', '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Pre-sleep', '2025-10-15', 22, 2, 'sleep', 'medium', 'Daily Operations', 'Wind down and sleep prep', '550e8400-e29b-41d4-a716-446655440002');

-- FE-2 Activities
INSERT INTO activities (crew_member_id, mission_id, name, date, start_hour, duration, type, priority, mission, description, created_by) VALUES
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Sleep', '2025-10-15', 0, 6, 'sleep', 'high', 'Daily Operations', 'Night sleep period', '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Post-sleep', '2025-10-15', 6, 1, 'sleep', 'medium', 'Daily Operations', 'Morning routine', '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Station Maintenance', '2025-10-15', 8, 4, 'work', 'high', 'ISS Maintenance', 'Life support system check', '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Lunch', '2025-10-15', 12.5, 0.5, 'meal', 'medium', 'Nutrition Program', 'Midday meal', '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Exercise', '2025-10-15', 15, 1.5, 'exercise', 'high', 'Health & Fitness', 'Resistance training', '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Pre-sleep', '2025-10-15', 22, 2, 'sleep', 'medium', 'Daily Operations', 'Evening routine', '550e8400-e29b-41d4-a716-446655440002');

-- FE-4 Activities
INSERT INTO activities (crew_member_id, mission_id, name, date, start_hour, duration, type, priority, mission, description, equipment, created_by) VALUES
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'Sleep', '2025-10-15', 0, 6, 'sleep', 'high', 'Daily Operations', 'Night sleep period', NULL, '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'Post-sleep', '2025-10-15', 6, 1, 'sleep', 'medium', 'Daily Operations', 'Morning routine', NULL, '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'EVA Preparation', '2025-10-15', 8, 2, 'eva', 'high', 'EVA-47', 'Spacewalk prep and suit check', ARRAY['EMU', 'Tools'], '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'Medical Check', '2025-10-15', 10, 0.5, 'work', 'high', 'Health Monitoring', 'Routine vitals', ARRAY['Medical Kit'], '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'Exercise', '2025-10-15', 12, 1, 'exercise', 'high', 'Health & Fitness', 'ARED training', ARRAY['ARED'], '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'Lunch', '2025-10-15', 13, 0.5, 'meal', 'medium', 'Nutrition Program', 'Midday meal', NULL, '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'Pre-sleep', '2025-10-15', 22, 2, 'sleep', 'medium', 'Daily Operations', 'Evening routine', NULL, '550e8400-e29b-41d4-a716-446655440002');

-- FE-5 Activities
INSERT INTO activities (crew_member_id, mission_id, name, date, start_hour, duration, type, priority, mission, description, equipment, created_by) VALUES
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 'Sleep', '2025-10-15', 0, 6, 'sleep', 'high', 'Daily Operations', 'Night sleep period', NULL, '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 'Post-sleep', '2025-10-15', 6.5, 0.5, 'sleep', 'medium', 'Daily Operations', 'Morning routine', NULL, '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 'EVA Preparation', '2025-10-15', 7, 1.5, 'eva', 'high', 'EVA-47', 'EMU fit check', ARRAY['EMU'], '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 'Optional Research', '2025-10-15', 9, 2, 'optional', 'low', 'Science', 'Additional experiments', NULL, '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 'P3 Maintenance', '2025-10-15', 13, 3, 'work', 'high', 'Station Maintenance', 'Truss inspection', ARRAY['Tools'], '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 'Dinner', '2025-10-15', 18, 1, 'meal', 'medium', 'Nutrition Program', 'Evening meal', NULL, '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 'Pre-sleep', '2025-10-15', 22, 2, 'sleep', 'medium', 'Daily Operations', 'Wind down', NULL, '550e8400-e29b-41d4-a716-446655440002');

-- Insert sample activities for Day 2 (2025-10-16) - EVA Day
INSERT INTO activities (crew_member_id, mission_id, name, date, start_hour, duration, type, priority, mission, description, equipment, created_by) VALUES
-- FE-4 EVA Day
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'Sleep', '2025-10-16', 0, 5, 'sleep', 'high', 'Daily Operations', 'Pre-EVA sleep', NULL, '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'EVA Day', '2025-10-16', 5, 8, 'eva', 'high', 'EVA-47', 'Spacewalk execution', ARRAY['EMU', 'Tools', 'Tethers'], '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'Post-EVA Recovery', '2025-10-16', 13, 2, 'work', 'high', 'EVA-47', 'Suit cleanup and debrief', NULL, '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'Meal', '2025-10-16', 15, 1, 'meal', 'medium', 'Nutrition Program', 'Post-EVA meal', NULL, '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'Pre-sleep', '2025-10-16', 21, 3, 'sleep', 'high', 'Daily Operations', 'Early sleep after EVA', NULL, '550e8400-e29b-41d4-a716-446655440002'),

-- FE-5 EVA Day
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 'Sleep', '2025-10-16', 0, 5, 'sleep', 'high', 'Daily Operations', 'Pre-EVA sleep', NULL, '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 'EVA Day', '2025-10-16', 5, 8, 'eva', 'high', 'EVA-47', 'Spacewalk with FE-4', ARRAY['EMU', 'Tools', 'Tethers'], '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 'Post-EVA', '2025-10-16', 13, 2, 'work', 'high', 'EVA-47', 'Recovery and debrief', NULL, '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 'Meal', '2025-10-16', 15, 1, 'meal', 'medium', 'Nutrition Program', 'Post-EVA meal', NULL, '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 'Pre-sleep', '2025-10-16', 21, 3, 'sleep', 'high', 'Daily Operations', 'Early sleep after EVA', NULL, '550e8400-e29b-41d4-a716-446655440002');

-- Note: Actual password hashes need to be generated by the backend
-- Use this script after backend is set up to update passwords:
-- UPDATE users SET password_hash = $2b$12$actual_hash WHERE username = 'admin';