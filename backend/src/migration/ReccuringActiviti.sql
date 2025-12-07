-- Add recurring fields to activities table

ALTER TABLE activities
ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN parent_activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
ADD COLUMN recurrence_type VARCHAR(20),
ADD COLUMN recurrence_interval INTEGER,
ADD COLUMN recurrence_days_of_week INTEGER[],
ADD COLUMN recurrence_end_date DATE;

-- Add index for faster queries on parent_activity_id
CREATE INDEX idx_activities_parent_activity_id ON activities(parent_activity_id);

-- Add index for recurring queries
CREATE INDEX idx_activities_is_recurring ON activities(is_recurring) WHERE is_recurring = TRUE;

COMMENT ON COLUMN activities.is_recurring IS 'Whether this activity is part of a recurring series';
COMMENT ON COLUMN activities.parent_activity_id IS 'Reference to parent activity if this is a recurring instance';
COMMENT ON COLUMN activities.recurrence_type IS 'Type of recurrence: daily, weekly, custom';
COMMENT ON COLUMN activities.recurrence_interval IS 'Interval for custom recurrence (e.g., every 2 days)';
COMMENT ON COLUMN activities.recurrence_days_of_week IS 'Days of week for weekly recurrence (0-6, 0=Sunday)';
COMMENT ON COLUMN activities.recurrence_end_date IS 'End date for recurring activities';