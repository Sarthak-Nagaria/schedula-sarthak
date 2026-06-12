import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReplacePatientAgeWithDateOfBirth1781252756477
  implements MigrationInterface
{
  name = 'ReplacePatientAgeWithDateOfBirth1781252756477';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "patient_profile" ADD "dateOfBirth" date`,
    );

    await queryRunner.query(
      `UPDATE "patient_profile" SET "dateOfBirth" = '2000-01-01' WHERE "dateOfBirth" IS NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "patient_profile" ALTER COLUMN "dateOfBirth" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "patient_profile" DROP COLUMN "age"`,
    );

    await queryRunner.query(
      `ALTER TABLE "custom_availability" DROP CONSTRAINT IF EXISTS "FK_1a33c02748c794ea9bf0a13fbf0"`,
    );

    await queryRunner.query(
      `ALTER TABLE "custom_availability" ALTER COLUMN "doctorId" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "custom_availability" ADD CONSTRAINT "FK_1a33c02748c794ea9bf0a13fbf0" FOREIGN KEY ("doctorId") REFERENCES "doctor_profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "custom_availability" DROP CONSTRAINT IF EXISTS "FK_1a33c02748c794ea9bf0a13fbf0"`,
    );

    await queryRunner.query(
      `ALTER TABLE "custom_availability" ALTER COLUMN "doctorId" DROP NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "custom_availability" ADD CONSTRAINT "FK_1a33c02748c794ea9bf0a13fbf0" FOREIGN KEY ("doctorId") REFERENCES "doctor_profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "patient_profile" ADD "age" integer`,
    );

    await queryRunner.query(
      `UPDATE "patient_profile" SET "age" = 0 WHERE "age" IS NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "patient_profile" ALTER COLUMN "age" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "patient_profile" DROP COLUMN "dateOfBirth"`,
    );
  }
}