import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDelayFieldsToVideoRoom1765127827114 implements MigrationInterface {
  name = 'AddDelayFieldsToVideoRoom1765127827114';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'video_rooms',
      new TableColumn({
        name: 'delay_seconds',
        type: 'float',
        default: 0,
        isNullable: false,
      })
    );

    await queryRunner.addColumn(
      'video_rooms',
      new TableColumn({
        name: 'delay_enabled',
        type: 'boolean',
        default: false,
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('video_rooms', 'delay_seconds');
    await queryRunner.dropColumn('video_rooms', 'delay_enabled');
  }
}
