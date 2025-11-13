import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActivityCommentsTable1763003610486 implements MigrationInterface {
  name = 'AddActivityCommentsTable1763003610486';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "activity_comments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "activity_id" uuid NOT NULL,
                "user_id" uuid NOT NULL,
                "comment" text NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_482bdd7c57a54d6b9c8312c81b5" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            ALTER TABLE "activity_comments" 
            ADD CONSTRAINT "FK_cad969263a33048ee27bce80ad2" 
            FOREIGN KEY ("activity_id") 
            REFERENCES "activities"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "activity_comments" 
            ADD CONSTRAINT "FK_b77d63375a93fe50125e004dada" 
            FOREIGN KEY ("user_id") 
            REFERENCES "users"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_activity_comments_activity_id" 
            ON "activity_comments" ("activity_id")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_activity_comments_user_id" 
            ON "activity_comments" ("user_id")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_activity_comments_created_at" 
            ON "activity_comments" ("created_at" DESC)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_activity_comments_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_activity_comments_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_activity_comments_activity_id"`);

    await queryRunner.query(`
            ALTER TABLE "activity_comments" 
            DROP CONSTRAINT IF EXISTS "FK_b77d63375a93fe50125e004dada"
        `);

    await queryRunner.query(`
            ALTER TABLE "activity_comments" 
            DROP CONSTRAINT IF EXISTS "FK_cad969263a33048ee27bce80ad2"
        `);

    await queryRunner.query(`DROP TABLE IF EXISTS "activity_comments"`);
  }
}
