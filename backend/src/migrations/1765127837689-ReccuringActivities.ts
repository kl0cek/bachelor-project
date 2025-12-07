import { MigrationInterface, QueryRunner } from "typeorm";

export class ReccuringActivities1765127837689 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE activities 
            ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
        `);

        await queryRunner.query(`
            ALTER TABLE activities 
            ADD COLUMN IF NOT EXISTS parent_activity_id UUID REFERENCES activities(id) ON DELETE CASCADE;
        `);

        await queryRunner.query(`
            ALTER TABLE activities 
            ADD COLUMN IF NOT EXISTS recurrence_type VARCHAR(20);
        `);

        await queryRunner.query(`
            ALTER TABLE activities 
            ADD COLUMN IF NOT EXISTS recurrence_interval INTEGER;
        `);

        await queryRunner.query(`
            ALTER TABLE activities 
            ADD COLUMN IF NOT EXISTS recurrence_days_of_week INTEGER[];
        `);

        await queryRunner.query(`
            ALTER TABLE activities 
            ADD COLUMN IF NOT EXISTS recurrence_end_date DATE;
        `);

        // Indexes
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_activities_parent_activity_id 
            ON activities(parent_activity_id);
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_activities_is_recurring 
            ON activities(is_recurring) WHERE is_recurring = TRUE;
        `);

        // Comments
        await queryRunner.query(`
            COMMENT ON COLUMN activities.is_recurring IS 'Whether this activity is part of a recurring series';
        `);
        await queryRunner.query(`
            COMMENT ON COLUMN activities.parent_activity_id IS 'Reference to parent activity if this is a recurring instance';
        `);
        await queryRunner.query(`
            COMMENT ON COLUMN activities.recurrence_type IS 'Type of recurrence: daily, weekly, custom';
        `);
        await queryRunner.query(`
            COMMENT ON COLUMN activities.recurrence_interval IS 'Interval for custom recurrence (e.g., every 2 days)';
        `);
        await queryRunner.query(`
            COMMENT ON COLUMN activities.recurrence_days_of_week IS 'Days of week for weekly recurrence (0-6, 0=Sunday)';
        `);
        await queryRunner.query(`
            COMMENT ON COLUMN activities.recurrence_end_date IS 'End date for recurring activities';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS idx_activities_is_recurring;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_activities_parent_activity_id;`);
        await queryRunner.query(`ALTER TABLE activities DROP COLUMN IF EXISTS recurrence_end_date;`);
        await queryRunner.query(`ALTER TABLE activities DROP COLUMN IF EXISTS recurrence_days_of_week;`);
        await queryRunner.query(`ALTER TABLE activities DROP COLUMN IF EXISTS recurrence_interval;`);
        await queryRunner.query(`ALTER TABLE activities DROP COLUMN IF EXISTS recurrence_type;`);
        await queryRunner.query(`ALTER TABLE activities DROP COLUMN IF EXISTS parent_activity_id;`);
        await queryRunner.query(`ALTER TABLE activities DROP COLUMN IF EXISTS is_recurring;`);
    }
}