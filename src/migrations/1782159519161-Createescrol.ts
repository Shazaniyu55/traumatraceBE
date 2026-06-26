import { MigrationInterface, QueryRunner } from "typeorm";

export class Createescrol1782159519161 implements MigrationInterface {
    name = 'Createescrol1782159519161'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "photoUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "therapists" ADD "addressLine" text`);
        await queryRunner.query(`ALTER TABLE "therapists" ADD "latitude" double precision`);
        await queryRunner.query(`ALTER TABLE "therapists" ADD "longitude" double precision`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "therapists" DROP COLUMN "longitude"`);
        await queryRunner.query(`ALTER TABLE "therapists" DROP COLUMN "latitude"`);
        await queryRunner.query(`ALTER TABLE "therapists" DROP COLUMN "addressLine"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "photoUrl"`);
    }

}
