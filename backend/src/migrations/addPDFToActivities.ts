import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPdfToActivities1763004000000 implements MigrationInterface {
  name = 'AddPdfToActivities1763004000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "activities" 
            ADD COLUMN "pdf_url" varchar(500) NULL
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_activities_pdf_url" 
            ON "activities" ("pdf_url")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_activities_pdf_url"
        `);

    await queryRunner.query(`
            ALTER TABLE "activities" 
            DROP COLUMN IF EXISTS "pdf_url"
        `);
  }
}
